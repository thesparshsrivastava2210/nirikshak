import math
from typing import List, Dict

class PeerEngine:
    """
    Peer Twin Intelligence Engine.
    Identifies 5-10 comparable historical projects for a target project using a 
    weighted multi-feature distance vector:
    - Project Type Match (35%)
    - Sanctioned Cost Similarity (25%)
    - Geographic / District Proximity (20%)
    - Implementation Scale & Duration (20%)
    """

    @staticmethod
    def calculate_similarity(p1: dict, p2: dict) -> float:
        if p1["id"] == p2["id"]:
            return 0.0
            
        score = 0.0
        
        # 1. Project Type Match (35 pts)
        if p1.get("project_type") == p2.get("project_type"):
            score += 35.0
        elif p1.get("project_type", "").split()[0] == p2.get("project_type", "").split()[0]:
            score += 20.0
            
        # 2. Sanctioned Cost Similarity (25 pts)
        c1 = p1.get("estimated_cost", 1)
        c2 = p2.get("estimated_cost", 1)
        cost_ratio = min(c1, c2) / max(c1, c2) if max(c1, c2) > 0 else 0
        score += cost_ratio * 25.0
        
        # 3. Geographic / District Proximity (20 pts)
        if p1.get("district") == p2.get("district"):
            score += 20.0
        elif p1.get("state") == p2.get("state"):
            score += 10.0
            
        # 4. Physical / Financial Scale Similarity (20 pts)
        f1 = p1.get("financial_progress", 0)
        f2 = p2.get("financial_progress", 0)
        fin_diff = abs(f1 - f2)
        scale_score = max(0.0, 20.0 - (fin_diff / 5.0))
        score += scale_score
        
        return round(min(99.0, score), 1)

    @staticmethod
    def find_peer_twins(target_project: dict, all_projects: List[dict], limit: int = 6) -> Tuple_PeerResults:
        scored = []
        for p in all_projects:
            if p["id"] == target_project["id"]:
                continue
            sim = PeerEngine.calculate_similarity(target_project, p)
            if sim > 40.0:
                scored.append({
                    "peer_project": p,
                    "similarity_score": sim,
                    "cost_diff_pct": round(((p.get("estimated_cost", 0) - target_project.get("estimated_cost", 1)) / target_project.get("estimated_cost", 1)) * 100, 1)
                })
                
        scored.sort(key=lambda x: x["similarity_score"], reverse=True)
        top_peers = scored[:limit]
        
        # Calculate peer benchmark metrics
        if top_peers:
            peer_costs = [item["peer_project"]["estimated_cost"] for item in top_peers]
            peer_progresses = [item["peer_project"]["physical_progress"] for item in top_peers]
            peer_finances = [item["peer_project"]["financial_progress"] for item in top_peers]
            
            peer_median_cost = round(sorted(peer_costs)[len(peer_costs) // 2], 2)
            peer_avg_progress = round(sum(peer_progresses) / len(peer_progresses), 1)
            peer_avg_finance = round(sum(peer_finances) / len(peer_finances), 1)
            
            cost_var = round(((target_project.get("estimated_cost", 0) - peer_median_cost) / peer_median_cost) * 100, 1) if peer_median_cost > 0 else 0
        else:
            peer_median_cost = target_project.get("estimated_cost", 0)
            peer_avg_progress = target_project.get("physical_progress", 0)
            peer_avg_finance = target_project.get("financial_progress", 0)
            cost_var = 0.0
            
        benchmarks = {
            "peer_median_cost": peer_median_cost,
            "peer_avg_progress": peer_avg_progress,
            "peer_avg_finance": peer_avg_finance,
            "current_cost": target_project.get("estimated_cost", 0),
            "current_progress": target_project.get("physical_progress", 0),
            "cost_variance_pct": cost_var,
            "status_summary": f"Current project cost is {abs(cost_var)}% {'above' if cost_var > 0 else 'below'} peer median benchmark."
        }
        
        return top_peers, benchmarks
