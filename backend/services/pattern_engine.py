from typing import List, Dict

class PatternEngine:
    """
    Cross-Project Pattern Intelligence Engine for NIRISHAK.
    Detects recurring anomalies across implementing agencies, vendors, and geographies.
    Builds graph nodes and edges for network relationship visualization.
    """

    @staticmethod
    def analyze_agency_patterns(agency: dict, agency_projects: List[dict]) -> dict:
        total = len(agency_projects)
        if total == 0:
            return {
                "agency_name": agency.get("agency_name"),
                "total_projects": 0,
                "pattern_risk_score": 0,
                "findings": []
            }

        high_risk_count = 0
        cost_dev_count = 0
        delay_count = 0
        mismatch_count = 0
        
        for p in agency_projects:
            exp = p.get("expenditure", 0)
            sanction = p.get("sanction_amount", 1)
            fin_prog = (exp / sanction * 100) if sanction > 0 else 0
            phys_prog = p.get("physical_progress", 0)
            
            if fin_prog - phys_prog > 20:
                mismatch_count += 1
            if p.get("status") == "Delayed" or phys_prog < 50:
                delay_count += 1
            if p.get("estimated_cost", 0) > 50: # High relative cost
                cost_dev_count += 1
            if fin_prog - phys_prog > 25 or phys_prog < 40:
                high_risk_count += 1

        pattern_risk = round(min(99.0, (high_risk_count / total * 50) + (mismatch_count / total * 30) + (delay_count / total * 20)), 1)
        
        findings = []
        if mismatch_count >= 3:
            findings.append(f"{mismatch_count} out of {total} projects show significant financial-physical progress mismatch.")
        if delay_count >= 4:
            findings.append(f"{delay_count} projects exhibit execution schedule delays.")
        if cost_dev_count >= 3:
            findings.append(f"{cost_dev_count} projects show cost estimates exceeding peer baseline.")

        return {
            "agency_id": agency.get("id"),
            "agency_name": agency.get("agency_name"),
            "agency_type": agency.get("agency_type"),
            "total_projects": total,
            "high_risk_projects": high_risk_count,
            "cost_deviation_cases": cost_dev_count,
            "delay_cases": delay_count,
            "mismatch_cases": mismatch_count,
            "pattern_risk_score": pattern_risk,
            "findings": findings
        }

    @staticmethod
    def generate_relationship_graph(projects: List[dict], agencies: List[dict], overlaps: List[dict]) -> dict:
        """Build Cytoscape/Vis.js compatible graph data structure."""
        nodes = []
        edges = []
        node_ids = set()

        # Add agency nodes
        for a in agencies:
            a_id = f"agency_{a['id']}"
            if a_id not in node_ids:
                nodes.append({
                    "id": a_id,
                    "label": a["agency_name"],
                    "group": "Agency",
                    "shape": "diamond",
                    "color": "#1E3E62", # Deep Navy
                    "size": 25,
                    "details": {
                        "type": "Agency",
                        "projects": a.get("total_projects", 0),
                        "risk_score": a.get("risk_score", 0)
                    }
                })
                node_ids.add(a_id)

        # Add project nodes & edges to agencies
        for p in projects:
            p_id = f"proj_{p['id']}"
            r_score = p.get("risk_score", 0)
            
            # Node color based on risk score
            if r_score >= 80:
                color = "#EF4444" # Red Critical
            elif r_score >= 60:
                color = "#F97316" # Orange High
            elif r_score >= 30:
                color = "#F59E0B" # Amber Medium
            else:
                color = "#10B981" # Green Low

            if p_id not in node_ids:
                nodes.append({
                    "id": p_id,
                    "label": f"{p['project_id']} - {p['project_name'][:20]}...",
                    "group": "Project",
                    "shape": "dot",
                    "color": color,
                    "size": 18,
                    "details": {
                        "type": "Project",
                        "full_name": p["project_name"],
                        "cost": p["estimated_cost"],
                        "progress": p["physical_progress"],
                        "risk": r_score
                    }
                })
                node_ids.add(p_id)

            # Edge between project and implementing agency
            a_id = f"agency_{p['implementing_agency_id']}"
            if a_id in node_ids:
                edges.append({
                    "from": a_id,
                    "to": p_id,
                    "label": "executed_by",
                    "color": "#94A3B8",
                    "width": 1.5
                })

        # Add overlap edges between projects
        for ov in overlaps:
            p1_id = f"proj_{ov['project_a_id']}"
            p2_id = f"proj_{ov['project_b_id']}"
            if p1_id in node_ids and p2_id in node_ids:
                edges.append({
                    "from": p1_id,
                    "to": p2_id,
                    "label": f"overlap ({ov['similarity_score']}%)",
                    "color": "#EF4444",
                    "dashes": True,
                    "width": 2
                })

        return {"nodes": nodes, "edges": edges}
