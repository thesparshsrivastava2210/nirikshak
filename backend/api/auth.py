from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login", response_model=schemas.UserResponse)
def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or user.password_hash != credentials.password:
        # Fallback for demo users
        if credentials.email in ["ministry@nirikshak.demo", "state@nirikshak.demo", "district@nirikshak.demo", "mp@nirikshak.demo"]:
            role_map = {
                "ministry@nirikshak.demo": ("Central Nodal Officer", "Ministry", "All India", "National"),
                "state@nirikshak.demo": ("State Director UP", "State Authority", "Uttar Pradesh", "State HQ"),
                "district@nirikshak.demo": ("District Magistrate", "District Authority", "Uttar Pradesh", "Varanasi"),
                "mp@nirikshak.demo": ("MP Office Varanasi", "MP / Constituency", "Uttar Pradesh", "Varanasi")
            }
            name, role, state, district = role_map[credentials.email]
            demo_user = models.User(
                name=name, email=credentials.email, password_hash="demo123",
                role=role, state=state, district=district, constituency=district
            )
            return demo_user
        raise HTTPException(status_code=401, detail="Invalid email or demo password")
    return user

@router.get("/users", response_model=list[schemas.UserResponse])
def get_demo_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()
