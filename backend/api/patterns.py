from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from services.pattern_engine import PatternEngine

router = APIRouter(prefix="/api/patterns", tags=["patterns"])

@router.get("/agencies")
def get_agency_patterns(db: Session = Depends(get_db)):
    agencies = db.query(models.Agency).all()
    results = []
    
    for a in agencies:
        a_projs = db.query(models.Project).filter(models.Project.implementing_agency_id == a.id).all()
        p_dicts = [{
            "id": p.id,
            "expenditure": p.expenditure,
            "sanction_amount": p.sanction_amount,
            "physical_progress": p.physical_progress,
            "estimated_cost": p.estimated_cost,
            "status": p.status
        } for p in a_projs]
        
        a_dict = {
            "id": a.id,
            "agency_name": a.agency_name,
            "agency_type": a.agency_type,
            "risk_score": a.risk_score
        }
        
        analysis = PatternEngine.analyze_agency_patterns(a_dict, p_dicts)
        results.append(analysis)
        
    return results

@router.get("/graph")
def get_relationship_graph(db: Session = Depends(get_db)):
    projects = db.query(models.Project).all()
    agencies = db.query(models.Agency).all()
    overlaps = db.query(models.ProjectRelationship).all()

    proj_list = []
    for p in projects:
        rs = db.query(models.RiskScore).filter(models.RiskScore.project_id == p.id).first()
        proj_list.append({
            "id": p.id,
            "project_id": p.project_id,
            "project_name": p.project_name,
            "estimated_cost": p.estimated_cost,
            "physical_progress": p.physical_progress,
            "implementing_agency_id": p.implementing_agency_id,
            "risk_score": rs.total_score if rs else 0.0
        })

    agency_list = [{
        "id": a.id,
        "agency_name": a.agency_name,
        "total_projects": a.total_projects,
        "risk_score": a.risk_score
    } for a in agencies]

    overlap_list = [{
        "project_a_id": o.project_a_id,
        "project_b_id": o.project_b_id,
        "similarity_score": o.similarity_score
    } for o in overlaps]

    graph_data = PatternEngine.generate_relationship_graph(proj_list, agency_list, overlap_list)
    return graph_data
