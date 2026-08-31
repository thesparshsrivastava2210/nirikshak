import os
import sys
from datetime import datetime, timedelta
from database import Base, engine, SessionLocal
import models
from services.risk_engine import RiskEngine
from services.peer_engine import PeerEngine
from services.geo_engine import GeoEngine

def seed_database():
    print("Initializing database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print("Seeding demo users...")
        users = [
            models.User(
                name="Central Nodal Officer",
                email="ministry@nirikshak.demo",
                password_hash="demo123",
                role="Ministry",
                state="All India",
                district="National Center",
                constituency="National"
            ),
            models.User(
                name="State Project Director (UP)",
                email="state@nirikshak.demo",
                password_hash="demo123",
                role="State Authority",
                state="Uttar Pradesh",
                district="State HQ",
                constituency="State Wide"
            ),
            models.User(
                name="District Magistrate / Nodal",
                email="district@nirikshak.demo",
                password_hash="demo123",
                role="District Authority",
                state="Uttar Pradesh",
                district="Varanasi",
                constituency="Varanasi Parliamentary"
            ),
            models.User(
                name="Member of Parliament Office",
                email="mp@nirikshak.demo",
                password_hash="demo123",
                role="MP / Constituency",
                state="Uttar Pradesh",
                district="Varanasi",
                constituency="Varanasi"
            )
        ]
        db.add_all(users)
        db.commit()

        print("Seeding implementing agencies...")
        agencies = [
            models.Agency(
                agency_name="UP Public Works Department (PWD) Division II",
                agency_type="Public Works Department",
                state="Uttar Pradesh",
                district="Varanasi",
                total_projects=24,
                completed_projects=12,
                delayed_projects=9,
                average_cost_deviation=22.4,
                risk_score=87.0
            ),
            models.Agency(
                agency_name="Rural Engineering Services (RES) Varanasi",
                agency_type="Rural Infrastructure",
                state="Uttar Pradesh",
                district="Varanasi",
                total_projects=18,
                completed_projects=14,
                delayed_projects=3,
                average_cost_deviation=8.1,
                risk_score=34.0
            ),
            models.Agency(
                agency_name="U.P. Jal Nigam Construction Division",
                agency_type="Water Supply & Sanitation",
                state="Uttar Pradesh",
                district="Lucknow",
                total_projects=15,
                completed_projects=7,
                delayed_projects=6,
                average_cost_deviation=18.5,
                risk_score=78.0
            ),
            models.Agency(
                agency_name="Karnataka Infrastructure Dev Corp (KIDC)",
                agency_type="Urban Infrastructure",
                state="Karnataka",
                district="Bengaluru Urban",
                total_projects=30,
                completed_projects=22,
                delayed_projects=4,
                average_cost_deviation=5.2,
                risk_score=28.0
            ),
            models.Agency(
                agency_name="Bihar Rajya Pul Nirman Nigam",
                agency_type="Bridges & Civil Works",
                state="Bihar",
                district="Patna",
                total_projects=16,
                completed_projects=9,
                delayed_projects=5,
                average_cost_deviation=15.8,
                risk_score=68.0
            )
        ]
        db.add_all(agencies)
        db.commit()

        # Reload agencies for IDs
        agencies_db = db.query(models.Agency).all()
        a_map = {a.agency_name: a.id for a in agencies_db}

        print("Seeding MPLADS projects dataset...")
        projects_data = [
            # High Risk Flagship Case P1045
            {
                "project_id": "P1045",
                "project_name": "Construction of Community Hall & Skill Center",
                "description": "Construction of RCC multipurpose community hall with sanitary fittings and solar lighting system at Shivpur ward.",
                "state": "Uttar Pradesh",
                "district": "Varanasi",
                "constituency": "Varanasi",
                "village": "Shivpur Ward 14",
                "project_type": "Community Hall Construction",
                "sanction_date": "2024-03-15",
                "expected_completion_date": "2025-01-30",
                "estimated_cost": 68.0,
                "sanction_amount": 68.0,
                "expenditure": 62.4, # 91.8% financial progress
                "physical_progress": 47.0, # 47% physical progress (mismatch!)
                "financial_progress": 91.8,
                "implementing_agency_id": a_map["UP Public Works Department (PWD) Division II"],
                "latitude": 25.3582,
                "longitude": 82.9731,
                "status": "Under Implementation"
            },
            # Potential Overlap Project P2098
            {
                "project_id": "P2098",
                "project_name": "Construction of Public Community Centre Building",
                "description": "Construction of public community center building with paved courtyard and boundary wall near Shivpur crossroad.",
                "state": "Uttar Pradesh",
                "district": "Varanasi",
                "constituency": "Varanasi",
                "village": "Shivpur Ward 12",
                "project_type": "Community Hall Construction",
                "sanction_date": "2024-05-10",
                "expected_completion_date": "2025-03-15",
                "estimated_cost": 72.0,
                "sanction_amount": 72.0,
                "expenditure": 64.8, # 90% financial
                "physical_progress": 51.0,
                "financial_progress": 90.0,
                "implementing_agency_id": a_map["UP Public Works Department (PWD) Division II"],
                "latitude": 25.3621, # 850m away from P1045
                "longitude": 82.9785,
                "status": "Under Implementation"
            },
            # Project P3812
            {
                "project_id": "P3812",
                "project_name": "Construction of Model Anganwadi & Child Care Center",
                "description": "Double storey model Anganwadi center building with drinking water storage tank.",
                "state": "Uttar Pradesh",
                "district": "Lucknow",
                "constituency": "Lucknow",
                "village": "Gomti Nagar Extension",
                "project_type": "Anganwadi Building",
                "sanction_date": "2024-01-20",
                "expected_completion_date": "2024-11-30",
                "estimated_cost": 51.0,
                "sanction_amount": 51.0,
                "expenditure": 45.0,
                "physical_progress": 42.0,
                "financial_progress": 88.2,
                "implementing_agency_id": a_map["U.P. Jal Nigam Construction Division"],
                "latitude": 26.8467,
                "longitude": 80.9462,
                "status": "Delayed"
            },
            # Project P4105
            {
                "project_id": "P4105",
                "project_name": "Installation of High Mast Solar Street Lights (50 Units)",
                "description": "Supply and installation of 50 standalone solar street light poles along main artery roads.",
                "state": "Bihar",
                "district": "Patna",
                "constituency": "Patna Sahib",
                "village": "Kankarbagh Sector 4",
                "project_type": "Solar Street Lighting",
                "sanction_date": "2024-02-10",
                "expected_completion_date": "2024-09-30",
                "estimated_cost": 45.0,
                "sanction_amount": 45.0,
                "expenditure": 41.5,
                "physical_progress": 55.0,
                "financial_progress": 92.2,
                "implementing_agency_id": a_map["Bihar Rajya Pul Nirman Nigam"],
                "latitude": 25.5941,
                "longitude": 85.1376,
                "status": "Under Implementation"
            },
            # Low Risk Reference Peer Projects
            {
                "project_id": "P5011",
                "project_name": "Construction of Rural Library & Reading Room",
                "description": "Single storey masonry reading room with toilet facilities and study furniture.",
                "state": "Uttar Pradesh",
                "district": "Varanasi",
                "constituency": "Varanasi",
                "village": "Pindra Block",
                "project_type": "Community Hall Construction",
                "sanction_date": "2023-11-01",
                "expected_completion_date": "2024-08-30",
                "estimated_cost": 48.0,
                "sanction_amount": 48.0,
                "expenditure": 46.0,
                "physical_progress": 95.0,
                "financial_progress": 95.8,
                "implementing_agency_id": a_map["Rural Engineering Services (RES) Varanasi"],
                "latitude": 25.4851,
                "longitude": 82.8541,
                "status": "Completed"
            },
            {
                "project_id": "P5012",
                "project_name": "Construction of Panchayat Samiti Multipurpose Center",
                "description": "RCC Panchayat Samiti hall with meeting room and computer facility.",
                "state": "Uttar Pradesh",
                "district": "Varanasi",
                "constituency": "Varanasi",
                "village": "Arajiline Block",
                "project_type": "Community Hall Construction",
                "sanction_date": "2023-12-15",
                "expected_completion_date": "2024-09-15",
                "estimated_cost": 52.0,
                "sanction_amount": 52.0,
                "expenditure": 49.5,
                "physical_progress": 92.0,
                "financial_progress": 95.2,
                "implementing_agency_id": a_map["Rural Engineering Services (RES) Varanasi"],
                "latitude": 25.2912,
                "longitude": 82.9105,
                "status": "Completed"
            },
            {
                "project_id": "P6001",
                "project_name": "Drinking Water Pipeline Extension & Overhead Tank",
                "description": "Laying of 4km HDPE water pipeline and construction of 50,000 litre elevated reservoir.",
                "state": "Karnataka",
                "district": "Bengaluru Urban",
                "constituency": "Bengaluru South",
                "village": "Kengeri Hobli",
                "project_type": "Drinking Water Pipeline",
                "sanction_date": "2024-01-10",
                "expected_completion_date": "2024-12-20",
                "estimated_cost": 85.0,
                "sanction_amount": 85.0,
                "expenditure": 70.0,
                "physical_progress": 82.0,
                "financial_progress": 82.3,
                "implementing_agency_id": a_map["Karnataka Infrastructure Dev Corp (KIDC)"],
                "latitude": 12.9141,
                "longitude": 77.4831,
                "status": "Under Implementation"
            },
            {
                "project_id": "P6002",
                "project_name": "Concrete Road Paving & Stormwater Drain",
                "description": "CC road paving 1.2km length with side drains and culverts.",
                "state": "Karnataka",
                "district": "Bengaluru Urban",
                "constituency": "Bengaluru South",
                "village": "Yelahanka New Town",
                "project_type": "Rural Road Concreting",
                "sanction_date": "2024-03-01",
                "expected_completion_date": "2024-11-15",
                "estimated_cost": 65.0,
                "sanction_amount": 65.0,
                "expenditure": 52.0,
                "physical_progress": 78.0,
                "financial_progress": 80.0,
                "implementing_agency_id": a_map["Karnataka Infrastructure Dev Corp (KIDC)"],
                "latitude": 13.1007,
                "longitude": 77.5963,
                "status": "Under Implementation"
            }
        ]

        # Add 12 additional realistic projects to reach 20 total dataset records
        for i in range(1, 13):
            projects_data.append({
                "project_id": f"P{7000+i}",
                "project_name": f"MPLADS Development Project #{i} - Public Amenities",
                "description": f"Infrastructure enhancement work including civil structures, street lighting, and sanitation facilities block #{i}.",
                "state": "Uttar Pradesh" if i % 2 == 0 else "Karnataka",
                "district": "Varanasi" if i % 2 == 0 else "Bengaluru Urban",
                "constituency": "Varanasi" if i % 2 == 0 else "Bengaluru South",
                "village": f"Sector {i} Village",
                "project_type": "Community Hall Construction" if i % 3 == 0 else "Drinking Water Pipeline",
                "sanction_date": "2024-02-01",
                "expected_completion_date": "2025-02-28",
                "estimated_cost": 40.0 + (i * 3.5),
                "sanction_amount": 40.0 + (i * 3.5),
                "expenditure": 30.0 + (i * 2.5),
                "physical_progress": min(95.0, 30.0 + (i * 5.0)),
                "financial_progress": min(98.0, 45.0 + (i * 4.5)),
                "implementing_agency_id": a_map["UP Public Works Department (PWD) Division II"] if i % 2 == 0 else a_map["Karnataka Infrastructure Dev Corp (KIDC)"],
                "latitude": 25.3176 + (i * 0.01),
                "longitude": 82.9739 + (i * 0.01),
                "status": "Under Implementation"
            })

        for p_dict in projects_data:
            proj = models.Project(**p_dict)
            db.add(proj)
        db.commit()

        # Load created projects
        all_projs = db.query(models.Project).all()
        proj_map = {p.project_id: p for p in all_projs}

        print("Seeding photo visual evidence records...")
        evidences = [
            # Evidence for P1045
            models.Evidence(
                project_id=proj_map["P1045"].id,
                file_url="https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&auto=format&fit=crop&q=80",
                latitude=25.3582,
                longitude=82.9731,
                capture_date="2024-04-15",
                evidence_type="Foundation Inspection",
                reported_progress=15.0,
                description="Excavation and brick masonry foundation laid. 15% physical completion verified."
            ),
            models.Evidence(
                project_id=proj_map["P1045"].id,
                file_url="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&auto=format&fit=crop&q=80",
                latitude=25.3582,
                longitude=82.9731,
                capture_date="2024-07-20",
                evidence_type="Superstructure Slab",
                reported_progress=35.0,
                description="RCC column casting completed. Formwork erected for roof slab. 35% progress."
            ),
            models.Evidence(
                project_id=proj_map["P1045"].id,
                file_url="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&auto=format&fit=crop&q=80",
                latitude=25.3582,
                longitude=82.9731,
                capture_date="2024-10-10",
                evidence_type="Wall Masonry & Plaster",
                reported_progress=47.0,
                description="Outer wall masonry complete. Interior electrical conduit wiring pending. Physical progress 47%."
            ),
            # Evidence for P2098
            models.Evidence(
                project_id=proj_map["P2098"].id,
                file_url="https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=600&auto=format&fit=crop&q=80",
                latitude=25.3621,
                longitude=82.9785,
                capture_date="2024-08-05",
                evidence_type="Roof Slab Inspection",
                reported_progress=51.0,
                description="Superstructure brickwork and roof slab cast. Interior finishing pending."
            )
        ]
        db.add_all(evidences)
        db.commit()

        print("Computing multi-factor risk scores & evidence factors...")
        projs_dict_list = [
            {
                "id": p.id,
                "project_id": p.project_id,
                "project_name": p.project_name,
                "description": p.description,
                "state": p.state,
                "district": p.district,
                "estimated_cost": p.estimated_cost,
                "sanction_amount": p.sanction_amount,
                "expenditure": p.expenditure,
                "physical_progress": p.physical_progress,
                "financial_progress": p.financial_progress,
                "status": p.status,
                "latitude": p.latitude,
                "longitude": p.longitude,
                "implementing_agency_id": p.implementing_agency_id
            } for p in all_projs
        ]

        for p_obj in all_projs:
            p_dict = next(item for item in projs_dict_list if item["id"] == p_obj.id)
            agency_obj = db.query(models.Agency).filter(models.Agency.id == p_obj.implementing_agency_id).first()
            agency_dict = {
                "id": agency_obj.id,
                "agency_name": agency_obj.agency_name,
                "risk_score": agency_obj.risk_score,
                "delayed_projects": agency_obj.delayed_projects
            } if agency_obj else {}

            top_peers, benchmarks = PeerEngine.find_peer_twins(p_dict, projs_dict_list)
            peer_dicts = [pt["peer_project"] for pt in top_peers]

            overlaps = GeoEngine.find_potential_overlaps(p_dict, projs_dict_list)

            score_data, factors = RiskEngine.calculate_project_risk(p_dict, agency_dict, peer_dicts, overlaps)

            # Hardcode P1045 to 92 Critical as requested by spec
            if p_obj.project_id == "P1045":
                score_data["total_score"] = 92.0
                score_data["risk_level"] = "CRITICAL"

            rs = models.RiskScore(
                project_id=p_obj.id,
                total_score=score_data["total_score"],
                financial_score=score_data["financial_score"],
                cost_score=score_data["cost_score"],
                delay_score=score_data["delay_score"],
                peer_score=score_data["peer_score"],
                duplicate_score=score_data["duplicate_score"],
                agency_score=score_data["agency_score"],
                risk_level=score_data["risk_level"]
            )
            db.add(rs)

            for f in factors:
                rf = models.RiskFactor(
                    project_id=p_obj.id,
                    factor_type=f["factor_type"],
                    score_contribution=f["score_contribution"],
                    title=f["title"],
                    description=f["description"],
                    evidence=f["evidence"]
                )
                db.add(rf)

        db.commit()

        print("Seeding spatial relationships & duplicate overlap records...")
        rel1 = models.ProjectRelationship(
            project_a_id=proj_map["P1045"].id,
            project_b_id=proj_map["P2098"].id,
            relationship_type="Potential Overlap",
            similarity_score=91.0,
            distance_meters=850.0
        )
        db.add(rel1)
        db.commit()

        print("Seeding priority investigation queue & inspection cases...")
        inv1 = models.Investigation(
            case_id="CAS-2024-001",
            project_id=proj_map["P1045"].id,
            priority=1,
            reason="Financial utilization (91.8%) far outpaces physical progress (47%) + 91% overlap with P2098.",
            recommended_action="Field Measurement Audit & Site Inspection",
            assigned_to="Shri Rajesh Kumar (District Nodal Officer)",
            assigned_role="District Magistrate Office",
            status="Open",
            due_date="2024-11-15",
            notes="Priority 1 case flagged by Risk Intelligence Engine. Requires physical Measurement Book verification."
        )
        inv2 = models.Investigation(
            case_id="CAS-2024-002",
            project_id=proj_map["P2098"].id,
            priority=2,
            reason="Potential work duplication with P1045 (850m distance) + high cost estimate deviation.",
            recommended_action="Financial Review & Cross-Verification",
            assigned_to="Er. Anil Verma (Executive Engineer)",
            assigned_role="State Inspection Cell",
            status="Assigned",
            due_date="2024-11-20",
            notes="Cross-check scope of work with P1045 to rule out double sanction."
        )
        inv3 = models.Investigation(
            case_id="CAS-2024-003",
            project_id=proj_map["P3812"].id,
            priority=3,
            reason="Delay in Anganwadi building construction despite 88.2% fund disbursement.",
            recommended_action="Document Verification & Progress Acceleration Notice",
            assigned_to="District Nodal Officer (Lucknow)",
            assigned_role="District Authority",
            status="In Review",
            due_date="2024-11-25",
            notes="Review contractor delay justification."
        )
        db.add_all([inv1, inv2, inv3])
        db.commit()

        print("Database seeding completed successfully!")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
