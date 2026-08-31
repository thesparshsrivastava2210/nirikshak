from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from services.peer_engine import PeerEngine

router = APIRouter(prefix="/api/peers", tags=["peers"])

@router.get("/{project_id}")
def get_peer_twins(project_id: str, db: Session = Depends(get_db)):
    if project_id.isdigit():
        target = db.query(models.Project).filter(models.Project.id == int(project_id)).first()
    else:
        target = db.query(models.Project).filter(models.Project.project_id == project_id).first()

    if not target:
        raise HTTPException(status_code=404, detail="Target project not found")

    all_projs = db.query(models.Project).all()
    all_dict_list = [
        {
            "id": p.id,
            "project_id": p.project_id,
            "project_name": p.project_name,
            "project_type": p.project_type,
            "state": p.state,
            "district": p.district,
            "estimated_cost": p.estimated_cost,
            "physical_progress": p.physical_progress,
            "financial_progress": p.financial_progress,
            "sanction_date": p.sanction_date,
            "expected_completion_date": p.expected_completion_date
        } for p in all_projs
    ]

    target_dict = next(p for p in all_dict_list if p["id"] == target.id)
    top_peers, benchmarks = PeerEngine.find_peer_twins(target_dict, all_dict_list, limit=6)

    formatted_peers = []
    for item in top_peers:
        p = item["peer_project"]
        rs = db.query(models.RiskScore).filter(models.RiskScore.project_id == p["id"]).first()
        formatted_peers.append({
            "id": p["id"],
            "project_id": p["project_id"],
            "project_name": p["project_name"],
            "district": p["district"],
            "estimated_cost": p["estimated_cost"],
            "physical_progress": p["physical_progress"],
            "financial_progress": p["financial_progress"],
            "similarity_score": item["similarity_score"],
            "cost_diff_pct": item["cost_diff_pct"],
            "risk_score": rs.total_score if rs else 0.0,
            "risk_level": rs.risk_level if rs else "LOW"
        })

    return {
        "target_project": {
            "id": target.id,
            "project_id": target.project_id,
            "project_name": target.project_name,
            "district": target.district,
            "estimated_cost": target.estimated_cost,
            "physical_progress": target.physical_progress,
            "financial_progress": target.financial_progress
        },
        "peer_twins": formatted_peers,
        "benchmarks": benchmarks
    }
