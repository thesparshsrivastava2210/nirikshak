from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: str
    role: str
    state: Optional[str] = None
    district: Optional[str] = None
    constituency: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class RiskFactorSchema(BaseModel):
    id: int
    factor_type: str
    score_contribution: float
    title: str
    description: str
    evidence: Optional[str] = None
    class Config:
        from_attributes = True

class RiskScoreSchema(BaseModel):
    total_score: float
    financial_score: float
    cost_score: float
    delay_score: float
    peer_score: float
    duplicate_score: float
    agency_score: float
    risk_level: str
    class Config:
        from_attributes = True

class EvidenceSchema(BaseModel):
    id: int
    file_url: str
    latitude: float
    longitude: float
    capture_date: str
    evidence_type: str
    reported_progress: float
    description: Optional[str] = None
    class Config:
        from_attributes = True

class ProjectSchema(BaseModel):
    id: int
    project_id: str
    project_name: str
    description: Optional[str] = None
    state: str
    district: str
    constituency: str
    village: Optional[str] = None
    project_type: str
    sanction_date: str
    expected_completion_date: str
    actual_completion_date: Optional[str] = None
    estimated_cost: float
    sanction_amount: float
    expenditure: float
    physical_progress: float
    financial_progress: float
    implementing_agency_id: int
    latitude: float
    longitude: float
    status: str
    agency_name: Optional[str] = None
    risk_score: Optional[float] = 0.0
    risk_level: Optional[str] = "LOW"
    class Config:
        from_attributes = True

class CreateCaseRequest(BaseModel):
    project_id: int
    priority: int
    reason: str
    recommended_action: str
    assigned_to: str
    assigned_role: str
    due_date: str
    notes: Optional[str] = None

class InvestigationSchema(BaseModel):
    id: int
    case_id: str
    project_id: int
    project_name: Optional[str] = None
    district: Optional[str] = None
    priority: int
    reason: str
    recommended_action: str
    assigned_to: Optional[str] = None
    assigned_role: Optional[str] = None
    status: str
    due_date: Optional[str] = None
    notes: Optional[str] = None
    risk_score: Optional[float] = 0.0
    sanction_amount: Optional[float] = 0.0
    class Config:
        from_attributes = True

class AssistantQueryRequest(BaseModel):
    query: str
