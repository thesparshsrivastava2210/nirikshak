from typing import List, Dict

class InvestigationEngine:
    """
    Investigation Prioritization & Workflow Engine for NIRISHAK.
    Ranks risk flags using financial exposure x evidence strength x risk score,
    and generates structured AI-Assisted Investigation Briefs.
    """

    @staticmethod
    def calculate_priority_score(project: dict, risk_score: float, factor_count: int) -> float:
        sanction = project.get("sanction_amount", 10.0) # In Lakhs
        # Priority = Risk Score * log10(Exposure) * Evidence Multiplier
        exposure_weight = min(3.0, (sanction / 20.0) + 1.0)
        evidence_multiplier = 1.0 + (factor_count * 0.1)
        
        priority_score = risk_score * exposure_weight * evidence_multiplier
        return round(priority_score, 1)

    @staticmethod
    def generate_investigation_brief(project: dict, risk_score_data: dict, factors: List[dict], agency: dict, peer_benchmarks: dict) -> dict:
        """
        Generates structured AI-Assisted Investigation Brief for authorities.
        """
        p_id = project.get("project_id")
        p_name = project.get("project_name")
        district = project.get("district")
        sanction = project.get("sanction_amount", 0)
        expenditure = project.get("expenditure", 0)
        phys_prog = project.get("physical_progress", 0)
        fin_prog = project.get("financial_progress", 0)

        # Build executive summary
        summary = (
            f"Project {p_id} ('{p_name}') in {district} has been prioritized for field verification "
            f"due to a Critical Risk Score of {risk_score_data.get('total_score', 0)}/100. "
            f"Financial utilization ({fin_prog}%) is significantly out of pace with reported ground physical completion ({phys_prog}%)."
        )

        # Primary risk signals
        signals = [f.get("title") + ": " + f.get("description") for f in factors]

        # Audit trail evidence summary
        evidence_summary = {
            "financial": f"₹{expenditure} Lakh disbursed out of ₹{sanction} Lakh sanctioned amount.",
            "progress": f"Ground progress recorded at {phys_prog}% against peer benchmark of {peer_benchmarks.get('peer_avg_progress', 70)}%.",
            "peer": peer_benchmarks.get("status_summary", "Cost exceeds peer benchmark."),
            "agency": f"Executed by {agency.get('agency_name')} (Agency Risk Score: {agency.get('risk_score')}/100)."
        }

        # Recommended verification checklist
        checklist = [
            "1. Conduct physical field measurement of completed civil work against MB (Measurement Book) entries.",
            "2. Audit recent contractor payment vouchers and bank transfer logs for expenditure justification.",
            "3. Cross-verify physical progress against geo-tagged satellite/photographic evidence.",
            "4. Inspect nearby public works within 1km radius to rule out work duplication or dual-billing.",
            "5. Review agency project history and past completion certificates."
        ]

        return {
            "brief_title": f"AI-Assisted Investigation Brief — {p_id}",
            "project_details": {
                "project_id": p_id,
                "project_name": p_name,
                "district": district,
                "state": project.get("state"),
                "constituency": project.get("constituency"),
                "sanction_amount": f"₹{sanction} Lakh",
                "expenditure": f"₹{expenditure} Lakh",
                "agency": agency.get("agency_name")
            },
            "risk_score": risk_score_data.get("total_score"),
            "risk_level": risk_score_data.get("risk_level"),
            "executive_summary": summary,
            "primary_signals": signals,
            "evidence": evidence_summary,
            "recommended_checklist": checklist,
            "recommended_action": "Field Verification & Measurement Book Audit"
        }
