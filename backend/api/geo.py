from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
import models
from services.geo_engine import GeoEngine

router = APIRouter(prefix="/api/geo", tags=["geo"])

@router.get("/overlaps")
def get_potential_overlaps(
    radius_meters: float = Query(5000.0),
    db: Session = Depends(get_db)
):
    projects = db.query(models.Project).all()
    all_dict_list = [{
        "id": p.id,
        "project_id": p.project_id,
        "project_name": p.project_name,
        "description": p.description,
        "district": p.district,
        "estimated_cost": p.estimated_cost,
        "physical_progress": p.physical_progress,
        "financial_progress": p.financial_progress,
        "latitude": p.latitude,
        "longitude": p.longitude
    } for p in projects]

    results = []
    seen_pairs = set()

    for p_dict in all_dict_list:
        overlaps = GeoEngine.find_potential_overlaps(p_dict, all_dict_list, max_distance_meters=radius_meters)
        for ov in overlaps:
            pair_key = tuple(sorted([p_dict["id"], ov["id"]]))
            if pair_key not in seen_pairs:
                seen_pairs.add(pair_key)
                results.append({
                    "project_a": p_dict,
                    "project_b": ov,
                    "distance_meters": ov["distance_meters"],
                    "similarity_score": ov["similarity_score"],
                    "status_note": f"Potentially overlapping works within {ov['distance_meters']}m distance — verification required."
                })

    return results

@router.get("/map-data")
def get_geo_map_data(db: Session = Depends(get_db)):
    projects = db.query(models.Project).all()
    markers = []
    
    for p in projects:
        rs = db.query(models.RiskScore).filter(models.RiskScore.project_id == p.id).first()
        r_lvl = rs.risk_level if rs else "LOW"
        r_score = rs.total_score if rs else 0.0
        agency = db.query(models.Agency).filter(models.Agency.id == p.implementing_agency_id).first()
        
        markers.append({
            "id": p.id,
            "project_id": p.project_id,
            "project_name": p.project_name,
            "district": p.district,
            "state": p.state,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "sanction_amount": p.sanction_amount,
            "physical_progress": p.physical_progress,
            "financial_progress": p.financial_progress,
            "risk_score": r_score,
            "risk_level": r_lvl,
            "agency_name": agency.agency_name if agency else "N/A"
        })
        
    return markers
