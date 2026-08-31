from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import get_db
import models
import schemas
from services.investigation_engine import InvestigationEngine
from services.peer_engine import PeerEngine

router = APIRouter(prefix="/api/investigations", tags=["investigations"])

@router.get("", response_model=List[schemas.InvestigationSchema])
def get_investigations(db: Session = Depends(get_db)):
    investigations = db.query(models.Investigation).order_by(models.Investigation.priority).all()
    results = []

    for inv in investigations:
        p = db.query(models.Project).filter(models.Project.id == inv.project_id).first()
        rs = db.query(models.RiskScore).filter(models.RiskScore.project_id == inv.project_id).first()
        
        inv_schema = schemas.InvestigationSchema.from_orm(inv)
        if p:
            inv_schema.project_name = p.project_name
            inv_schema.district = p.district
            inv_schema.sanction_amount = p.sanction_amount
        if rs:
            inv_schema.risk_score = rs.total_score

        results.append(inv_schema)

    return results

@router.get("/{investigation_id}/brief")
def get_investigation_brief(investigation_id: int, db: Session = Depends(get_db)):
    inv = db.query(models.Investigation).filter(models.Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation case not found")

    p = db.query(models.Project).filter(models.Project.id == inv.project_id).first()
    rs = db.query(models.RiskScore).filter(models.RiskScore.project_id == inv.project_id).first()
    factors = db.query(models.RiskFactor).filter(models.RiskFactor.project_id == inv.project_id).all()
    agency = db.query(models.Agency).filter(models.Agency.id == p.implementing_agency_id).first()

    all_projs = db.query(models.Project).all()
    all_dict_list = [{"id": x.id, "estimated_cost": x.estimated_cost, "physical_progress": x.physical_progress, "financial_progress": x.financial_progress, "project_type": x.project_type, "district": x.district} for x in all_projs]
    target_dict = next(x for x in all_dict_list if x["id"] == p.id)
    _, benchmarks = PeerEngine.find_peer_twins(target_dict, all_dict_list)

    risk_data = {"total_score": rs.total_score if rs else 80.0, "risk_level": rs.risk_level if rs else "HIGH"}
    factor_dicts = [{"title": f.title, "description": f.description} for f in factors]
    agency_dict = {"agency_name": agency.agency_name if agency else "N/A", "risk_score": agency.risk_score if agency else 50.0}

    project_dict = {
        "project_id": p.project_id,
        "project_name": p.project_name,
        "district": p.district,
        "state": p.state,
        "constituency": p.constituency,
        "sanction_amount": p.sanction_amount,
        "expenditure": p.expenditure,
        "physical_progress": p.physical_progress,
        "financial_progress": p.financial_progress
    }

    brief = InvestigationEngine.generate_investigation_brief(project_dict, risk_data, factor_dicts, agency_dict, benchmarks)
    return brief

@router.post("/create", response_model=schemas.InvestigationSchema)
def create_inspection_case(req: schemas.CreateCaseRequest, db: Session = Depends(get_db)):
    # Check if project exists
    p = db.query(models.Project).filter(models.Project.id == req.project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")

    case_count = db.query(models.Investigation).count() + 1
    case_id = f"CAS-2024-00{case_count}"

    new_inv = models.Investigation(
        case_id=case_id,
        project_id=req.project_id,
        priority=req.priority,
        reason=req.reason,
        recommended_action=req.recommended_action,
        assigned_to=req.assigned_to,
        assigned_role=req.assigned_role,
        status="Open",
        due_date=req.due_date,
        notes=req.notes
    )
    db.add(new_inv)
    db.commit()
    db.refresh(new_inv)

    inv_schema = schemas.InvestigationSchema.from_orm(new_inv)
    inv_schema.project_name = p.project_name
    inv_schema.district = p.district
    inv_schema.sanction_amount = p.sanction_amount
    return inv_schema

@router.patch("/{investigation_id}/status")
def update_investigation_status(investigation_id: int, status: str, db: Session = Depends(get_db)):
    inv = db.query(models.Investigation).filter(models.Investigation.id == investigation_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation case not found")

    inv.status = status
    inv.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Status updated successfully", "case_id": inv.case_id, "new_status": inv.status}
