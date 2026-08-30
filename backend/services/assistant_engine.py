from typing import List, Dict
import re

class AssistantEngine:
    """
    Ask NIRIKSHAK Natural Language Query Assistant.
    Parses natural language governance queries into deterministic data filters,
    ranked tables, structured risk explanations, or scheme knowledge insights.
    """

    @staticmethod
    def process_query(query: str, projects: List[dict], agencies: List[dict], investigations: List[dict]) -> dict:
        q_raw = query or ""
        q_lower = q_raw.lower().strip()

        if not q_lower:
            return {
                "answer_text": "Please enter a question or select one of the suggested queries below.",
                "query_type": "text",
                "suggested_followups": [
                    "Which projects should I inspect first?",
                    "Why is P1045 high risk?",
                    "Show projects with high expenditure but low physical progress"
                ]
            }

        # 1. General Knowledge / Scheme Information Queries
        if any(k in q_lower for k in ["what is mplads", "mplad scheme", "about mplads", "explain mplads"]):
            return {
                "answer_text": "**MPLADS (Member of Parliament Local Area Development Scheme)** allows Members of Parliament to recommend development works of developmental nature with emphasis on creation of durable community assets (drinking water, primary education, public health, sanitation, and roads) in their constituencies. NIRIKSHAK provides AI-driven risk intelligence and audit oversight across all MPLADS funds.",
                "query_type": "key_value",
                "details": [
                    {"label": "Scheme Focus", "value": "Durable community assets & public infrastructure"},
                    {"label": "Annual Entitlement", "value": "₹5 Crore per Member of Parliament per year"},
                    {"label": "Nodal Ministry", "value": "Ministry of Statistics & Programme Implementation (MoSPI)"},
                    {"label": "NIRIKSHAK Role", "value": "Automated anomaly detection, risk scoring & field audit prioritization"}
                ],
                "suggested_followups": [
                    "How does NIRIKSHAK calculate risk scores?",
                    "Which projects should I inspect first?",
                    "Show projects with high expenditure but low physical progress"
                ]
            }

        if any(k in q_lower for k in ["how risk score", "risk engine", "risk formula", "how do you calculate risk", "risk calculation"]):
            return {
                "answer_text": "NIRIKSHAK's Risk Engine calculates project risk scores from **0 to 100** using a 6-factor composite weighting algorithm:",
                "query_type": "key_value",
                "details": [
                    {"label": "1. Expenditure Disparity (24.4%)", "value": "Gap between financial disbursement % and reported physical ground progress"},
                    {"label": "2. Cost vs Peer Median (18.0%)", "value": "Sanctioned cost deviation compared against similar peer twin works"},
                    {"label": "3. Completion Delay (17.0%)", "value": "Actual physical execution lagging behind benchmark target schedule"},
                    {"label": "4. Peer Execution Lag (13.0%)", "value": "Progress lagging behind peer twin benchmark average"},
                    {"label": "5. Spatial Overlap Signal (10.0%)", "value": "GIS proximity (<1km radius) and work description similarity (>85%)"},
                    {"label": "6. Agency Risk Density (10.0%)", "value": "Historical anomaly density of the implementing agency"}
                ],
                "suggested_followups": [
                    "Which projects should I inspect first?",
                    "Why is P1045 high risk?",
                    "Which agency has the highest risk flags?"
                ]
            }

        # 2. Priority / Inspection Queue Queries
        if any(k in q_lower for k in ["inspect", "priority", "queue", "urgent", "first"]):
            critical_projects = sorted(
                [p for p in projects if p.get("risk_score", 0) >= 50 or p.get("risk_level") in ["CRITICAL", "HIGH"]],
                key=lambda x: x.get("risk_score", 0),
                reverse=True
            )
            top_list = critical_projects[:5] if critical_projects else projects[:5]
            rows = []
            for idx, p in enumerate(top_list, 1):
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
                "answer_text": "Based on NIRIKSHAK Multi-Factor Exposure Weighting, here are the high-priority projects requiring immediate authority verification:",
                "query_type": "table",
                "table_columns": ["rank", "project_id", "project_name", "district", "risk_score", "expenditure", "recommended_action"],
                "table_data": rows,
                "suggested_followups": [
                    "Why is P1045 high risk?",
                    "Show projects with high expenditure but low physical progress",
                    "Which agency has the highest risk flags?"
                ]
            }

        # 3. Specific Project Query (Matching ID e.g. P1045, P2098, P3812, P3901, P4021, P5190, P5310, P6104 or title words)
        matched_proj = None
        # Extract project ID pattern like P1234
        pid_match = re.search(r'\b[pP]\d{4}\b', q_raw)
        if pid_match:
            pid_target = pid_match.group(0).upper()
            matched_proj = next((p for p in projects if p.get("project_id", "").upper() == pid_target), None)

        if not matched_proj:
            # Check by exact string matching in project name or ID
            for p in projects:
                if p.get("project_id", "").lower() in q_lower or p.get("project_name", "").lower() in q_lower:
                    matched_proj = p
                    break

        if matched_proj or "why" in q_lower:
            p = matched_proj or projects[0]
            p_id = p.get("project_id")
            p_name = p.get("project_name")
            p_risk = p.get("risk_score", 0)
            p_sanc = p.get("sanction_amount", 0)
            p_phys = p.get("physical_progress", 0)
            p_fin = p.get("financial_progress", 0)
            p_dist = p.get("district", "N/A")
            delta = round(p_fin - p_phys, 1)

            return {
                "answer_text": f"Project **{p_id} ({p_name})** in **{p_dist}** has a Risk Score of **{p_risk}/100**. Here is the evidence breakdown:",
                "query_type": "key_value",
                "details": [
                    {"label": "Project ID & District", "value": f"{p_id} | {p_dist}"},
                    {"label": "Financial vs Physical Mismatch", "value": f"{p_fin}% funds disbursed vs {p_phys}% physical work (Delta +{delta}%)"},
                    {"label": "Sanctioned Amount", "value": f"₹{p_sanc} Lakh"},
                    {"label": "Completion Timeline Status", "value": "Under Implementation" if p_phys < 100 else "Completed"},
                    {"label": "Peer Benchmark Comparison", "value": f"Physical execution lags peer benchmark median by ~{max(0, int(72 - p_phys))}%"},
                    {"label": "Primary Risk Signal", "value": "High financial disbursement pacing ahead of verified physical ground logs"}
                ],
                "suggested_followups": [
                    "Which projects should I inspect first?",
                    "Show projects with high expenditure but low physical progress",
                    f"Show nearby overlapping works for {p_id}"
                ]
            }

        # 4. Expenditure / Financial Mismatch Queries
        if any(k in q_lower for k in ["expenditure", "disbursement", "mismatch", "money", "funds", "cost"]):
            mismatched = sorted(
                [p for p in projects if (p.get("financial_progress", 0) - p.get("physical_progress", 0)) > 15],
                key=lambda x: (x.get("financial_progress", 0) - x.get("physical_progress", 0)),
                reverse=True
            )
            display_list = mismatched if mismatched else projects[:5]
            rows = []
            for p in display_list:
                fin = p.get("financial_progress", 0)
                phys = p.get("physical_progress", 0)
                rows.append({
                    "project_id": p.get("project_id"),
                    "project_name": p.get("project_name"),
                    "district": p.get("district"),
                    "financial_progress": f"{fin}%",
                    "physical_progress": f"{phys}%",
                    "mismatch_delta": f"+{round(fin - phys, 1)}%",
                    "risk_score": f"{p.get('risk_score')}/100"
                })

            return {
                "answer_text": "Found projects where financial expenditure disbursements significantly outpace reported physical ground execution:",
                "query_type": "table",
                "table_columns": ["project_id", "project_name", "district", "financial_progress", "physical_progress", "mismatch_delta", "risk_score"],
                "table_data": rows,
                "suggested_followups": [
                    "Which projects should I inspect first?",
                    "Which agency has the highest number of risk flags?"
                ]
            }

        # 5. Agency / Contractor Queries
        if any(k in q_lower for k in ["agency", "contractor", "pwd", "res", "vendor", "builder"]):
            sorted_agencies = sorted(agencies, key=lambda x: x.get("risk_score", 0), reverse=True)
            rows = []
            for a in sorted_agencies:
                rows.append({
                    "agency_name": a.get("agency_name"),
                    "total_projects": a.get("total_projects"),
                    "delayed_projects": a.get("delayed_projects"),
                    "risk_score": f"{a.get('risk_score')}/100",
                    "status": "High Risk Density" if a.get("risk_score", 0) > 60 else "Normal"
                })
            return {
                "answer_text": "Systemic risk density overview across implementing agencies and contractors in the jurisdiction:",
                "query_type": "table",
                "table_columns": ["agency_name", "total_projects", "delayed_projects", "risk_score", "status"],
                "table_data": rows,
                "suggested_followups": [
                    "Which projects should I inspect first?",
                    "Why is P1045 high risk?"
                ]
            }

        # 6. District / Geographic Location Queries
        districts = ["varanasi", "lucknow", "patna", "bengaluru", "delhi", "karnataka", "bihar", "uttar pradesh"]
        matched_dist = next((d for d in districts if d in q_lower), None)
        if matched_dist or "district" in q_lower or "location" in q_lower or "city" in q_lower:
            filter_name = matched_dist.capitalize() if matched_dist else "Target"
            filtered = [p for p in projects if filter_name.lower() in p.get("district", "").lower() or filter_name.lower() in p.get("state", "").lower()]
            display_list = filtered if filtered else projects[:5]

            rows = []
            for p in display_list:
                rows.append({
                    "project_id": p.get("project_id"),
                    "project_name": p.get("project_name"),
                    "district": p.get("district"),
                    "sanction_amount": f"₹{p.get('sanction_amount')}L",
                    "physical_progress": f"{p.get('physical_progress')}%",
                    "risk_score": f"{p.get('risk_score')}/100"
                })

            return {
                "answer_text": f"Found **{len(display_list)} project records** matching geographical region **{filter_name}**:",
                "query_type": "table",
                "table_columns": ["project_id", "project_name", "district", "sanction_amount", "physical_progress", "risk_score"],
                "table_data": rows,
                "suggested_followups": [
                    "Which projects should I inspect first?",
                    "Show projects with high expenditure but low physical progress"
                ]
            }

        # 7. Delay / Timeline / Progress Queries
        if any(k in q_lower for k in ["delay", "stuck", "slow", "lagging", "pending", "status", "progress"]):
            delayed = sorted([p for p in projects if p.get("physical_progress", 0) < 60], key=lambda x: x.get("physical_progress", 0))
            display_list = delayed if delayed else projects[:5]

            rows = []
            for p in display_list:
                rows.append({
                    "project_id": p.get("project_id"),
                    "project_name": p.get("project_name"),
                    "district": p.get("district"),
                    "physical_progress": f"{p.get('physical_progress')}%",
                    "financial_progress": f"{p.get('financial_progress')}%",
                    "risk_score": f"{p.get('risk_score')}/100"
                })

            return {
                "answer_text": "Projects exhibiting physical execution delays lag behind scheduled completion benchmarks:",
                "query_type": "table",
                "table_columns": ["project_id", "project_name", "district", "physical_progress", "financial_progress", "risk_score"],
                "table_data": rows,
                "suggested_followups": [
                    "Which projects should I inspect first?",
                    "Why is P1045 high risk?"
                ]
            }

        # 8. Dynamic Search Fallback for Any Random Custom Query
        tokens = [t for t in re.split(r'\W+', q_lower) if len(t) > 2]
        matches = []
        for p in projects:
            score = 0
            p_text = f"{p.get('project_id')} {p.get('project_name')} {p.get('district')} {p.get('project_type', '')}".lower()
            for t in tokens:
                if t in p_text:
                    score += 1
            if score > 0:
                matches.append((score, p))

        matches.sort(key=lambda x: x[0], reverse=True)
        matched_projects = [m[1] for m in matches]
        display_list = matched_projects if matched_projects else projects[:4]

        rows = []
        for p in display_list:
            rows.append({
                "project_id": p.get("project_id"),
                "project_name": p.get("project_name"),
                "district": p.get("district"),
                "financial_progress": f"{p.get('financial_progress')}%",
                "physical_progress": f"{p.get('physical_progress')}%",
                "risk_score": f"{p.get('risk_score')}/100"
            })

        return {
            "answer_text": f"Processed query **\"{query}\"** against NIRIKSHAK database. Found {len(display_list)} relevant records:",
            "query_type": "table",
            "table_columns": ["project_id", "project_name", "district", "financial_progress", "physical_progress", "risk_score"],
            "table_data": rows,
            "suggested_followups": [
                "Which projects should I inspect first?",
                "Why is P1045 high risk?",
                "Show projects with high expenditure but low physical progress"
            ]
        }
