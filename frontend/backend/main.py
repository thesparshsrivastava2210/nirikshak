import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from seed_data import seed_database

from api import auth, dashboard, projects, peers, patterns, geo, investigations, reports, assistant

app = FastAPI(
    title="NIRIKSHAK API",
    description="MPLADS Project Monitoring & Risk Intelligence Platform API",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(projects.router)
app.include_router(peers.router)
app.include_router(patterns.router)
app.include_router(geo.router)
app.include_router(investigations.router)
app.include_router(reports.router)
app.include_router(assistant.router)

from database import engine, Base, DB_PATH

@app.on_event("startup")
def on_startup():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}. Triggering automated seed...")
        seed_database()

@app.get("/api/health")
def health_check():
    return {"status": "online", "system": "NIRIKSHAK Risk Intelligence Platform", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
