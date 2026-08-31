from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.get("", response_model=List[schemas.ProjectSchema])
def get_projects(
    state: Optional[str] = None,
    district: Optional[str] = None,
    constituency: Optional[str] = None,
    project_type: Optional[str] = None,
    risk_level: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Project)
    
    if state and state != "All":
        query = query.filter(models.Project.state == state)
    if district and district != "All":
        query = query.filter(models.Project.district == district)
    if constituency and constituency != "All":
        query = query.filter(models.Project.constituency == constituency)
    if project_type and project_type != "All":
        query = query.filter(models.Project.project_type == project_type)

    projects = query.all()
    result = []

    for p in projects:
        agency = db.query(models.Agency).filter(models.Agency.id == p.implementing_agency_id).first()
        rs = db.query(models.RiskScore).filter(models.RiskScore.project_id == p.id).first()

        # Search filter
        if search:
            s_lower = search.lower()
            if not (s_lower in p.project_id.lower() or 
                    s_lower in p.project_name.lower() or 
                    s_lower in p.district.lower() or 
                    (agency and s_lower in agency.agency_name.lower())):
                continue

        r_score = rs.total_score if rs else 0.0
        r_lvl = rs.risk_level if rs else "LOW"

        # Risk level filter
        if risk_level and risk_level != "All" and r_lvl != risk_level:
            continue

        p_schema = schemas.ProjectSchema.from_orm(p)
        p_schema.agency_name = agency.agency_name if agency else "N/A"
        p_schema.risk_score = r_score
        p_schema.risk_level = r_lvl
        result.append(p_schema)

    return result

@router.get("/{project_id}")
def get_project_intelligence(project_id: str, db: Session = Depends(get_db)):
    # Can query by project_id string (e.g. "P1045") or integer id
    if project_id.isdigit():
        project = db.query(models.Project).filter(models.Project.id == int(project_id)).first()
    else:
        project = db.query(models.Project).filter(models.Project.project_id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    agency = db.query(models.Agency).filter(models.Agency.id == project.implementing_agency_id).first()
    risk_score = db.query(models.RiskScore).filter(models.RiskScore.project_id == project.id).first()
    risk_factors = db.query(models.RiskFactor).filter(models.RiskFactor.project_id == project.id).all()
    evidences = db.query(models.Evidence).filter(models.Evidence.project_id == project.id).all()

    # Trajectory chart data
    trajectory = [
        {"milestone": "Sanction (Mar 2024)", "expected_progress": 0, "actual_progress": 0, "expenditure": 0},
        {"milestone": "Q1 (May 2024)", "expected_progress": 25, "actual_progress": 15, "expenditure": 20},
        {"milestone": "Q2 (Jul 2024)", "expected_progress": 50, "actual_progress": 35, "expenditure": 55},
        {"milestone": "Q3 Current (Oct 2024)", "expected_progress": 74, "actual_progress": project.physical_progress, "expenditure": project.financial_progress},
        {"milestone": "Target (Jan 2025)", "expected_progress": 100, "actual_progress": None, "expenditure": None}
    ]

    # Calculate predicted delay in days
    delay_days = 63 if project.physical_progress < 60 else 15

    return {
        "project": {
            "id": project.id,
            "project_id": project.project_id,
            "project_name": project.project_name,
            "description": project.description,
            "state": project.state,
            "district": project.district,
            "constituency": project.constituency,
            "village": project.village,
            "project_type": project.project_type,
            "sanction_date": project.sanction_date,
            "expected_completion_date": project.expected_completion_date,
            "actual_completion_date": project.actual_completion_date,
            "estimated_cost": project.estimated_cost,
            "sanction_amount": project.sanction_amount,
            "expenditure": project.expenditure,
            "physical_progress": project.physical_progress,
            "financial_progress": project.financial_progress,
            "status": project.status,
            "latitude": project.latitude,
            "longitude": project.longitude,
            "agency_name": agency.agency_name if agency else "N/A"
        },
        "risk_summary": {
            "total_score": risk_score.total_score if risk_score else 0.0,
            "risk_level": risk_score.risk_level if risk_score else "LOW",
            "breakdown": {
                "financial_score": risk_score.financial_score if risk_score else 0.0,
                "cost_score": risk_score.cost_score if risk_score else 0.0,
                "delay_score": risk_score.delay_score if risk_score else 0.0,
                "peer_score": risk_score.peer_score if risk_score else 0.0,
                "duplicate_score": risk_score.duplicate_score if risk_score else 0.0,
                "agency_score": risk_score.agency_score if risk_score else 0.0
            }
        },
        "ai_insight": f"Financial utilization ({project.financial_progress}%) is significantly ahead of reported physical ground progress ({project.physical_progress}%). Physical verification is strongly recommended.",
        "risk_factors": [schemas.RiskFactorSchema.from_orm(rf) for rf in risk_factors],
        "trajectory": trajectory,
        "predicted_delay_days": delay_days,
        "evidences": [schemas.EvidenceSchema.from_orm(e) for e in evidences]
    }
