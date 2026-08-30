import math
from typing import Dict, List, Tuple

class RiskEngine:
    """
    Transparent Multi-Factor Risk Intelligence Engine for NIRISHAK.
    Calculates risk score (0-100) based on six distinct quantitative dimensions:
    1. Financial-Physical Mismatch (max 25 pts)
    2. Cost Deviation vs Peer Baseline (max 20 pts)
    3. Completion Delay & Schedule Slippage (max 20 pts)
    4. Peer Deviation Variance (max 15 pts)
    5. Geo Proximity & Duplicate Overlap Signal (max 10 pts)
    6. Implementing Agency Risk Density (max 10 pts)
    """

    @staticmethod
    def calculate_project_risk(project: dict, agency: dict, peers: List[dict], nearby_overlaps: List[dict]) -> Tuple[dict, List[dict]]:
        expenditure = project.get("expenditure", 0)
        sanction_amount = project.get("sanction_amount", 1)
        physical_progress = project.get("physical_progress", 0)
        estimated_cost = project.get("estimated_cost", sanction_amount)
        
        # Calculate financial progress %
        financial_progress = (expenditure / sanction_amount * 100) if sanction_amount > 0 else 0
        financial_progress = min(100.0, max(0.0, financial_progress))
        
        factors = []
        
        # 1. Financial-Physical Mismatch (0 - 25 pts)
        fin_phys_delta = financial_progress - physical_progress
        financial_score = 0.0
        if financial_progress > 40 and fin_phys_delta > 15:
            # Significant financial expenditure ahead of reported physical ground progress
            financial_score = min(25.0, (fin_phys_delta / 50.0) * 25.0)
            factors.append({
                "factor_type": "Financial-Physical Mismatch",
                "score_contribution": round(financial_score, 1),
                "title": "Expenditure Disparity",
                "description": f"{round(financial_progress, 1)}% of sanctioned funds disbursed while physical execution stands at only {round(physical_progress, 1)}%.",
                "evidence": f"Financial Progress: {round(financial_progress, 1)}% | Physical Progress: {round(physical_progress, 1)}% | Delta: +{round(fin_phys_delta, 1)}%"
            })
            
        # 2. Cost Deviation vs Peers (0 - 20 pts)
        cost_score = 0.0
        if peers:
            peer_costs = [p["estimated_cost"] for p in peers if p.get("estimated_cost")]
            if peer_costs:
                peer_median = sorted(peer_costs)[len(peer_costs) // 2]
                if peer_median > 0:
                    cost_dev_pct = ((estimated_cost - peer_median) / peer_median) * 100
                    if cost_dev_pct > 10:
                        cost_score = min(20.0, (cost_dev_pct / 40.0) * 20.0)
                        factors.append({
                            "factor_type": "Cost Deviation",
                            "score_contribution": round(cost_score, 1),
                            "title": "Peer Cost Variance",
                            "description": f"Project sanctioned cost (₹{round(estimated_cost, 2)} Lakh) is {round(cost_dev_pct, 1)}% higher than peer median (₹{round(peer_median, 2)} Lakh).",
                            "evidence": f"Sanctioned: ₹{round(estimated_cost, 2)}L | Peer Median: ₹{round(peer_median, 2)}L | Deviation: +{round(cost_dev_pct, 1)}%"
                        })

        # 3. Schedule Slippage & Delay (0 - 20 pts)
        delay_score = 0.0
        status = project.get("status", "")
        if status == "Delayed" or physical_progress < 50:
            # Estimate delay days based on progress vs elapsed duration
            expected_progress = 75.0 # Typical benchmark expected progress
            progress_gap = max(0.0, expected_progress - physical_progress)
            delay_score = min(20.0, (progress_gap / 50.0) * 20.0)
            if delay_score > 5:
                factors.append({
                    "factor_type": "Completion Deviation",
                    "score_contribution": round(delay_score, 1),
                    "title": "Timeline Slippage",
                    "description": f"Physical ground progress ({round(physical_progress, 1)}%) lags benchmark expected completion target ({round(expected_progress, 1)}%).",
                    "evidence": f"Actual Progress: {round(physical_progress, 1)}% | Expected: {round(expected_progress, 1)}% | Lag: -{round(progress_gap, 1)}%"
                })

        # 4. Peer Unit Progress Variance (0 - 15 pts)
        peer_score = 0.0
        if peers:
            peer_progresses = [p["physical_progress"] for p in peers]
            if peer_progresses:
                peer_avg_progress = sum(peer_progresses) / len(peer_progresses)
                if peer_avg_progress - physical_progress > 20:
                    peer_score = min(15.0, ((peer_avg_progress - physical_progress) / 40.0) * 15.0)
                    factors.append({
                        "factor_type": "Peer Deviation",
                        "score_contribution": round(peer_score, 1),
                        "title": "Peer Twin Progress Lag",
                        "description": f"Project ground execution ({round(physical_progress, 1)}%) lags behind peer twin average ({round(peer_avg_progress, 1)}%).",
                        "evidence": f"Project Progress: {round(physical_progress, 1)}% | Peer Twin Average: {round(peer_avg_progress, 1)}%"
                    })

        # 5. Geo Proximity & Duplicate Overlap Signal (0 - 10 pts)
        duplicate_score = 0.0
        if nearby_overlaps:
            max_sim = max([o.get("similarity_score", 0) for o in nearby_overlaps], default=0)
            if max_sim > 70:
                duplicate_score = min(10.0, (max_sim / 100.0) * 10.0)
                closest = nearby_overlaps[0]
                factors.append({
                    "factor_type": "Potential Overlap",
                    "score_contribution": round(duplicate_score, 1),
                    "title": "Duplicate Work Signal",
                    "description": f"Potential spatial and description overlap detected with project '{closest.get('project_name')}' within {closest.get('distance_meters', 0)}m distance.",
                    "evidence": f"Similarity: {closest.get('similarity_score')}% | Proximity: {closest.get('distance_meters')}m | Work Type Match: High"
                })

        # 6. Agency Risk Density (0 - 10 pts)
        agency_score = 0.0
        if agency:
            avg_agency_risk = agency.get("risk_score", 0.0)
            if avg_agency_risk > 50:
                agency_score = min(10.0, (avg_agency_risk / 100.0) * 10.0)
                factors.append({
                    "factor_type": "Agency Pattern",
                    "score_contribution": round(agency_score, 1),
                    "title": "Contractor Anomaly Cluster",
                    "description": f"Implementing agency '{agency.get('agency_name')}' exhibits systemic risk factors across multiple active projects.",
                    "evidence": f"Agency Risk Index: {round(avg_agency_risk, 1)}/100 | Delayed Projects: {agency.get('delayed_projects', 0)}"
                })

        # Sum total risk score (0 - 100)
        total_score = min(100.0, financial_score + cost_score + delay_score + peer_score + duplicate_score + agency_score)
        
        # Categorize risk level
        if total_score >= 80:
            risk_level = "CRITICAL"
        elif total_score >= 60:
            risk_level = "HIGH"
        elif total_score >= 30:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"
            
        score_breakdown = {
            "total_score": round(total_score, 1),
            "financial_score": round(financial_score, 1),
            "cost_score": round(cost_score, 1),
            "delay_score": round(delay_score, 1),
            "peer_score": round(peer_score, 1),
            "duplicate_score": round(duplicate_score, 1),
            "agency_score": round(agency_score, 1),
            "risk_level": risk_level
        }
        
        return score_breakdown, factors
