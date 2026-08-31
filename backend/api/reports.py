from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/summary")
def get_report_summary(
    state: str = "All",
    district: str = "All",
    risk_level: str = "All",
    db: Session = Depends(get_db)
):
    projects_query = db.query(models.Project)
    if state != "All":
        projects_query = projects_query.filter(models.Project.state == state)
    if district != "All":
        projects_query = projects_query.filter(models.Project.district == district)

    projects = projects_query.all()
    total_sanctioned = sum(p.sanction_amount for p in projects)
    total_expenditure = sum(p.expenditure for p in projects)
    avg_physical = sum(p.physical_progress for p in projects) / len(projects) if projects else 0

    critical_projs = []
    high_projs = []

    for p in projects:
        rs = db.query(models.RiskScore).filter(models.RiskScore.project_id == p.id).first()
        r_lvl = rs.risk_level if rs else getattr(p, "risk_level", "LOW")
        r_score = rs.total_score if rs else getattr(p, "risk_score", 0.0)

        if risk_level != "All" and r_lvl != risk_level:
            continue

        item = {
            "project_id": p.project_id,
            "project_name": p.project_name,
            "district": p.district,
            "sanction_amount": p.sanction_amount,
            "expenditure": p.expenditure,
            "physical_progress": p.physical_progress,
            "financial_progress": p.financial_progress,
            "risk_score": r_score,
            "risk_level": r_lvl
        }

        if r_lvl == "CRITICAL" or r_score >= 80:
            critical_projs.append(item)
        elif r_lvl == "HIGH" or (r_score >= 50 and r_score < 80):
            high_projs.append(item)

    return {
        "report_title": f"MPLADS Governance Risk & Audit Report ({district if district != 'All' else (state if state != 'All' else 'National Summary')})",
        "generated_date": "2024-10-24",
        "authority_scope": f"State: {state} | District: {district}",
        "executive_summary": (
            f"Analysis of {len(projects)} sanctioned MPLADS works totaling ₹{round(total_sanctioned/100, 2)} Cr in {district if district != 'All' else 'the selected jurisdiction'}. "
            f"Average physical completion stands at {round(avg_physical, 1)}%. "
            f"{len(critical_projs)} works require high-priority physical measurement verification."
        ),
        "metrics": {
            "total_projects": len(projects),
            "total_sanctioned_cr": round(total_sanctioned / 100.0, 2),
            "total_expenditure_cr": round(total_expenditure / 100.0, 2),
            "avg_physical_progress": round(avg_physical, 1),
            "critical_risk_count": len(critical_projs),
            "high_risk_count": len(high_projs)
        },
        "critical_projects": critical_projs,
        "high_risk_projects": high_projs
    }
