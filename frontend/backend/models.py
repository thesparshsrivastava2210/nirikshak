from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    role = Column(String(50), nullable=False) # Ministry, State, District, MP
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    constituency = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Agency(Base):
    __tablename__ = "agencies"

    id = Column(Integer, primary_key=True, index=True)
    agency_name = Column(String(200), nullable=False, index=True)
    agency_type = Column(String(100), nullable=False) # Public Works, Irrigation, Rural Dev, etc.
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    total_projects = Column(Integer, default=0)
    completed_projects = Column(Integer, default=0)
    delayed_projects = Column(Integer, default=0)
    average_cost_deviation = Column(Float, default=0.0)
    risk_score = Column(Float, default=0.0)

    projects = relationship("Project", back_populates="agency")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String(50), unique=True, index=True, nullable=False)
    project_name = Column(String(250), nullable=False)
    description = Column(Text, nullable=True)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    constituency = Column(String(100), nullable=False, index=True)
    village = Column(String(100), nullable=True)
    project_type = Column(String(100), nullable=False, index=True)
    sanction_date = Column(String(20), nullable=False)
    expected_completion_date = Column(String(20), nullable=False)
    actual_completion_date = Column(String(20), nullable=True)
    estimated_cost = Column(Float, nullable=False) # In Lakhs
    sanction_amount = Column(Float, nullable=False) # In Lakhs
    expenditure = Column(Float, nullable=False) # In Lakhs
    physical_progress = Column(Float, nullable=False) # Percentage 0-100
    financial_progress = Column(Float, nullable=False) # Percentage 0-100
    implementing_agency_id = Column(Integer, ForeignKey("agencies.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String(50), default="Under Implementation") # Completed, Under Implementation, Delayed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    agency = relationship("Agency", back_populates="projects")
    evidence_list = relationship("Evidence", back_populates="project", cascade="all, delete-orphan")
    risk_score_rel = relationship("RiskScore", uselist=False, back_populates="project", cascade="all, delete-orphan")
    risk_factors = relationship("RiskFactor", back_populates="project", cascade="all, delete-orphan")
    investigations = relationship("Investigation", back_populates="project", cascade="all, delete-orphan")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    payment_date = Column(String(20), nullable=False)
    amount = Column(Float, nullable=False)
    payment_type = Column(String(50), nullable=False) # Mobilization Advance, Stage 1, Final Bill, etc.
    agency_id = Column(Integer, ForeignKey("agencies.id"), nullable=False)

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    file_url = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capture_date = Column(String(20), nullable=False)
    evidence_type = Column(String(50), default="Site Photograph")
    reported_progress = Column(Float, default=0.0)
    description = Column(Text, nullable=True)

    project = relationship("Project", back_populates="evidence_list")

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, unique=True)
    total_score = Column(Float, nullable=False) # 0 - 100
    financial_score = Column(Float, default=0.0) # 0 - 25
    cost_score = Column(Float, default=0.0) # 0 - 20
    delay_score = Column(Float, default=0.0) # 0 - 20
    peer_score = Column(Float, default=0.0) # 0 - 15
    duplicate_score = Column(Float, default=0.0) # 0 - 10
    agency_score = Column(Float, default=0.0) # 0 - 10
    risk_level = Column(String(20), nullable=False) # LOW, MEDIUM, HIGH, CRITICAL
    generated_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="risk_score_rel")

class RiskFactor(Base):
    __tablename__ = "risk_factors"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    factor_type = Column(String(100), nullable=False) # Financial-Physical Mismatch, Cost Deviation, etc.
    score_contribution = Column(Float, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="risk_factors")

class ProjectRelationship(Base):
    __tablename__ = "project_relationships"

    id = Column(Integer, primary_key=True, index=True)
    project_a_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    project_b_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    relationship_type = Column(String(100), nullable=False) # Potential Overlap, Peer Twin, Same Agency
    similarity_score = Column(Float, nullable=False) # 0 - 100
    distance_meters = Column(Float, nullable=True)

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String(50), unique=True, index=True, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    priority = Column(Integer, nullable=False) # 1, 2, 3, etc.
    reason = Column(String(250), nullable=False)
    recommended_action = Column(String(250), nullable=False)
    assigned_to = Column(String(100), nullable=True)
    assigned_role = Column(String(50), nullable=True)
    status = Column(String(50), default="Open") # Open, Assigned, In Review, Verified, Closed
    due_date = Column(String(20), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="investigations")
    actions = relationship("InspectionAction", back_populates="investigation", cascade="all, delete-orphan")

class InspectionAction(Base):
    __tablename__ = "inspection_actions"

    id = Column(Integer, primary_key=True, index=True)
    investigation_id = Column(Integer, ForeignKey("investigations.id"), nullable=False)
    action_type = Column(String(100), nullable=False)
    action_status = Column(String(50), nullable=False)
    comments = Column(Text, nullable=True)
    created_by = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    investigation = relationship("Investigation", back_populates="actions")
