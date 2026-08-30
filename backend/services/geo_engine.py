import math
from typing import List, Dict

class GeoEngine:
    """
    Spatial & Overlap Intelligence Engine for NIRISHAK.
    Calculates geographic distance using Haversine formula and computes text similarity 
    between project titles and descriptions to identify potential work overlaps.
    """

    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate the great circle distance between two points in meters."""
        R = 6371000  # Radius of Earth in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)

        a = math.sin(delta_phi / 2.0) ** 2 + \
            math.cos(phi1) * math.cos(phi2) * \
            math.sin(delta_lambda / 2.0) ** 2

        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return round(R * c, 1)

    @staticmethod
    def text_similarity(str1: str, str2: str) -> float:
        """Calculate Jaccard & N-gram text similarity score (0 - 100%)."""
        if not str1 or not str2:
            return 0.0
            
        words1 = set(str1.lower().replace(",", "").replace(".", "").split())
        words2 = set(str2.lower().replace(",", "").replace(".", "").split())
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        if not union:
            return 0.0
            
        jaccard = len(intersection) / len(union)
        
        # Check prefix match for common project terms (e.g. "Community Hall", "Road Construction")
        common_prefixes = ["community", "hall", "centre", "center", "road", "water", "pipeline", "anganwadi", "solar", "street"]
        prefix_match_count = sum(1 for w in intersection if w in common_prefixes)
        
        bonus = min(0.3, prefix_match_count * 0.1)
        similarity = min(1.0, jaccard + bonus)
        
        return round(similarity * 100, 1)

    @classmethod
    def find_potential_overlaps(cls, target_project: dict, all_projects: List[dict], max_distance_meters: float = 5000.0) -> List[dict]:
        overlaps = []
        t_lat = target_project.get("latitude", 0)
        t_lon = target_project.get("longitude", 0)
        t_name = target_project.get("project_name", "")
        t_desc = target_project.get("description", "")
        
        for p in all_projects:
            if p["id"] == target_project["id"]:
                continue
                
            dist = cls.haversine_distance(t_lat, t_lon, p.get("latitude", 0), p.get("longitude", 0))
            if dist <= max_distance_meters:
                name_sim = cls.text_similarity(t_name, p.get("project_name", ""))
                desc_sim = cls.text_similarity(t_desc, p.get("description", ""))
                max_sim = max(name_sim, desc_sim)
                
                # Combine distance factor and similarity
                if max_sim > 50.0 or (dist < 1000 and max_sim > 40.0):
                    overlaps.append({
                        "id": p["id"],
                        "project_id": p.get("project_id"),
                        "project_name": p.get("project_name"),
                        "district": p.get("district"),
                        "estimated_cost": p.get("estimated_cost"),
                        "physical_progress": p.get("physical_progress"),
                        "financial_progress": p.get("financial_progress"),
                        "distance_meters": dist,
                        "similarity_score": max_sim,
                        "risk_level": "POTENTIAL_OVERLAP" if max_sim > 70 else "REQUIRES_VERIFICATION",
                        "status_note": f"Distance: {dist}m | Description Similarity: {max_sim}% — Verification Required"
                    })
                    
        overlaps.sort(key=lambda x: (x["similarity_score"], -x["distance_meters"]), reverse=True)
        return overlaps
