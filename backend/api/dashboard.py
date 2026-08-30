from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    projects = db.query(models.Project).all()
    total_works = len(projects)
    total_expenditure = sum(p.expenditure for p in projects)
    avg_completion = sum(p.physical_progress for p in projects) / total_works if total_works > 0 else 0
    
    # Risk stats
    risk_scores = db.query(models.RiskScore).all()
    critical_count = sum(1 for r in risk_scores if r.risk_level == "CRITICAL")
    high_count = sum(1 for r in risk_scores if r.risk_level == "HIGH")
    medium_count = sum(1 for r in risk_scores if r.risk_level == "MEDIUM")
    low_count = sum(1 for r in risk_scores if r.risk_level == "LOW")
    total_flags = critical_count + high_count + medium_count

    # Priority Investigation Queue Top Items
    investigations = db.query(models.Investigation).order_by(models.Investigation.priority).all()
    queue = []
    for inv in investigations:
        p = db.query(models.Project).filter(models.Project.id == inv.project_id).first()
        rs = db.query(models.RiskScore).filter(models.RiskScore.project_id == inv.project_id).first()
        if p:
            queue.append({
                "rank": inv.priority,
                "investigation_id": inv.id,
                "project_id": p.project_id,
                "project_name": p.project_name,
                "district": p.district,
                "risk_score": rs.total_score if rs else 80.0,
                "risk_level": rs.risk_level if rs else "HIGH",
                "primary_signal": inv.reason[:60] + "...",
                "financial_exposure": f"₹{p.sanction_amount} Lakh",
                "recommended_action": inv.recommended_action,
                "status": inv.status
            })

    # Risk trend over time (monthly dataset)
    risk_trend = [
        {"month": "May 2024", "critical": 2, "high": 5, "medium": 8},
        {"month": "Jun 2024", "critical": 2, "high": 7, "medium": 11},
        {"month": "Jul 2024", "critical": 3, "high": 9, "medium": 14},
        {"month": "Aug 2024", "critical": 4, "high": 12, "medium": 18},
        {"month": "Sep 2024", "critical": 5, "high": 15, "medium": 22},
        {"month": "Oct 2024", "critical": 6, "high": 18, "medium": 25}
    ]

    # Detected patterns highlights
    detected_patterns = [
        {"id": 1, "text": "7 projects linked to UP PWD Division II show similar cost deviation exceeding peer baseline."},
        {"id": 2, "text": "4 potentially overlapping works detected in Varanasi Shivpur block within 1km radius."},
        {"id": 3, "text": "12 projects show financial expenditure disbursements exceeding physical progress by >20%."}
    ]

    return {
        "summary": {
            "total_works": total_works,
            "total_expenditure_cr": round(total_expenditure / 100.0, 2), # In Crores
            "total_expenditure_lakh": round(total_expenditure, 1),
            "avg_completion": round(avg_completion, 1),
            "risk_flags": total_flags,
            "critical_projects": critical_count,
            "high_risk_projects": high_count,
            "medium_risk_projects": medium_count,
            "low_risk_projects": low_count
        },
        "priority_queue": queue,
        "risk_trend": risk_trend,
        "detected_patterns": detected_patterns
    }
