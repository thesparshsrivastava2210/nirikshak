from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from services.assistant_engine import AssistantEngine

router = APIRouter(prefix="/api/assistant", tags=["assistant"])

@router.post("/query")
def ask_nirikshak(req: schemas.AssistantQueryRequest, db: Session = Depends(get_db)):
    projects = db.query(models.Project).all()
    agencies = db.query(models.Agency).all()
    investigations = db.query(models.Investigation).all()

    proj_list = []
    for p in projects:
        rs = db.query(models.RiskScore).filter(models.RiskScore.project_id == p.id).first()
        proj_list.append({
            "id": p.id,
            "project_id": p.project_id,
            "project_name": p.project_name,
            "district": p.district,
            "sanction_amount": p.sanction_amount,
            "expenditure": p.expenditure,
            "physical_progress": p.physical_progress,
            "financial_progress": p.financial_progress,
            "risk_score": rs.total_score if rs else 0.0,
            "risk_level": rs.risk_level if rs else "LOW"
        })

    agency_list = [{
        "id": a.id,
        "agency_name": a.agency_name,
        "total_projects": a.total_projects,
        "delayed_projects": a.delayed_projects,
        "risk_score": a.risk_score
    } for a in agencies]

    inv_list = [{"id": i.id, "case_id": i.case_id} for i in investigations]

    res = AssistantEngine.process_query(req.query, proj_list, agency_list, inv_list)
    return res
