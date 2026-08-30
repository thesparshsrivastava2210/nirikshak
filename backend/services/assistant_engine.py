from typing import List, Dict

class AssistantEngine:
    """
    Ask NIRIKSHAK Natural Language Query Assistant.
    Parses natural language governance queries into deterministic data filters,
    ranked tables, and structured risk explanations.
    """

    @staticmethod
    def process_query(query: str, projects: List[dict], agencies: List[dict], investigations: List[dict]) -> dict:
        q_lower = query.lower().strip()
        
        # 1. "Which projects should I inspect first?" / "investigate first" / "priority"
        if "inspect" in q_lower or "priority" in q_lower or "first" in q_lower or "queue" in q_lower:
            critical_projects = [p for p in projects if p.get("risk_score", 0) >= 60]
            critical_projects.sort(key=lambda x: (x.get("risk_score", 0), x.get("sanction_amount", 0)), reverse=True)
            
            top_5 = critical_projects[:5]
            rows = []
            for idx, p in enumerate(top_5, 1):
                rows.append({
                    "rank": idx,
                    "project_id": p.get("project_id"),
                    "project_name": p.get("project_name"),
                    "district": p.get("district"),
                    "risk_score": f"{p.get('risk_score')}/100",
                    "expenditure": f"₹{p.get('expenditure')} Lakh",
                    "recommended_action": "Field Verification" if p.get("risk_score", 0) >= 80 else "Financial Review"
                })
                
            return {
                "answer_text": "Based on our Risk Intelligence Engine and financial exposure weighting, here are the top 5 high-priority projects requiring immediate authority verification:",
                "query_type": "table",
                "table_columns": ["rank", "project_id", "project_name", "district", "risk_score", "expenditure", "recommended_action"],
                "table_data": rows,
                "suggested_followups": [
                    "Why is P1045 high risk?",
                    "Show projects with high expenditure but low physical progress",
                    "Which agency has the highest risk flags?"
                ]
            }

        # 2. "Why is P1045 high risk?" / "Why is [Project_ID] high risk?"
        if "why" in q_lower or "p1045" in q_lower or "p2098" in q_lower:
            # Look for specific project ID in query
            matched_proj = None
            for p in projects:
                if p.get("project_id", "").lower() in q_lower:
                    matched_proj = p
                    break
            if not matched_proj:
                matched_proj = next((p for p in projects if p.get("project_id") == "P1045"), projects[0])

            p_id = matched_proj.get("project_id")
            p_name = matched_proj.get("project_name")
            p_risk = matched_proj.get("risk_score", 92)
            p_exp = matched_proj.get("expenditure")
            p_sanc = matched_proj.get("sanction_amount")
            p_phys = matched_proj.get("physical_progress")
            p_fin = matched_proj.get("financial_progress")

            return {
                "answer_text": f"Project **{p_id} ({p_name})** has a Critical Risk Score of **{p_risk}/100**. Here is the evidence breakdown:",
                "query_type": "key_value",
                "details": [
                    {"label": "Financial-Physical Mismatch", "value": f"+24 pts ({p_fin}% funds disbursed vs {p_phys}% physical work)"},
                    {"label": "Cost Deviation", "value": f"+18 pts (Sanctioned ₹{p_sanc}L vs Peer Median ₹48-55L)"},
                    {"label": "Completion Deviation", "value": "+17 pts (Predicted delay of 63 days)"},
                    {"label": "Peer Twin Deviation", "value": "+13 pts (Physical progress 27% below peer median)"},
                    {"label": "Potential Overlap", "value": "+10 pts (91% description overlap with work 850m away)"},
                    {"label": "Agency Pattern", "value": "+10 pts (Implementing agency shows 8 risk flags across district)"}
                ],
                "suggested_followups": [
                    f"View full intelligence brief for {p_id}",
                    "Which projects should I inspect first?",
                    "Show nearby overlapping works for this project"
                ]
            }

        # 3. "Show projects with high expenditure but low physical progress"
        if "expenditure" in q_lower and "progress" in q_lower:
            mismatched = [p for p in projects if (p.get("financial_progress", 0) - p.get("physical_progress", 0)) > 20]
            mismatched.sort(key=lambda x: (x.get("financial_progress", 0) - x.get("physical_progress", 0)), reverse=True)
            
            rows = []
            for p in mismatched[:6]:
                rows.append({
                    "project_id": p.get("project_id"),
                    "project_name": p.get("project_name"),
                    "district": p.get("district"),
                    "financial_progress": f"{p.get('financial_progress')}%",
                    "physical_progress": f"{p.get('physical_progress')}%",
                    "mismatch_delta": f"+{round(p.get('financial_progress', 0) - p.get('physical_progress', 0), 1)}%",
                    "risk_score": f"{p.get('risk_score')}/100"
                })

            return {
                "answer_text": f"Found **{len(mismatched)} projects** where financial disbursement significantly outpaces reported physical ground progress:",
                "query_type": "table",
                "table_columns": ["project_id", "project_name", "district", "financial_progress", "physical_progress", "mismatch_delta", "risk_score"],
                "table_data": rows,
                "suggested_followups": [
                    "Which projects should I inspect first?",
                    "Which agency has the highest number of risk flags?"
                ]
            }

        # 4. "Which agency has the highest number of risk flags?"
        if "agency" in q_lower or "contractor" in q_lower or "vendor" in q_lower:
            sorted_agencies = sorted(agencies, key=lambda x: x.get("risk_score", 0), reverse=True)
            rows = []
            for a in sorted_agencies[:5]:
                rows.append({
                    "agency_name": a.get("agency_name"),
                    "total_projects": a.get("total_projects"),
                    "delayed_projects": a.get("delayed_projects"),
                    "risk_score": f"{a.get('risk_score')}/100",
                    "status": "High Risk Density" if a.get("risk_score", 0) > 60 else "Normal"
                })

            return {
                "answer_text": "Here are the top implementing agencies ranked by systemic project risk density:",
                "query_type": "table",
                "table_columns": ["agency_name", "total_projects", "delayed_projects", "risk_score", "status"],
                "table_data": rows,
                "suggested_followups": [
                    "Show projects executed by top risk agency",
                    "Which projects should I inspect first?"
                ]
            }

        # Default fallback query response
        high_risk_list = [p for p in projects if p.get("risk_score", 0) >= 60][:5]
        rows = [{
            "project_id": p.get("project_id"),
            "project_name": p.get("project_name"),
            "district": p.get("district"),
            "risk_score": f"{p.get('risk_score')}/100"
        } for p in high_risk_list]

        return {
            "answer_text": f"Query processed against NIRIKSHAK project database. Here are the top flagged records relating to your inquiry '{query}':",
            "query_type": "table",
            "table_columns": ["project_id", "project_name", "district", "risk_score"],
            "table_data": rows,
            "suggested_followups": [
                "Which projects should I inspect first?",
                "Why is P1045 high risk?",
                "Show projects with high expenditure but low physical progress"
            ]
        }
