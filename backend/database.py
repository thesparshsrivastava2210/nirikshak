import os
import shutil
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

IS_VERCEL = os.environ.get("VERCEL", "0") == "1"

if IS_VERCEL:
    DB_PATH = "/tmp/nirikshak.db"
else:
    DB_PATH = os.path.join(os.path.dirname(__file__), "nirikshak.db")

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

_db_initialized = False

def init_db_if_needed():
    global _db_initialized
    if _db_initialized:
        return
    
    try:
        # Create all tables if missing
        Base.metadata.create_all(bind=engine)
        
        # Check if source db exists and can be copied to /tmp
        source_db = os.path.join(os.path.dirname(__file__), "nirikshak.db")
        if IS_VERCEL and os.path.exists(source_db) and DB_PATH != source_db and (not os.path.exists(DB_PATH) or os.path.getsize(DB_PATH) == 0):
            try:
                shutil.copyfile(source_db, DB_PATH)
            except Exception as e:
                print("Failed to copy source db to /tmp:", e)

        # Verify if database has records
        db = SessionLocal()
        try:
            import models
            count = db.query(models.Project).count()
            if count == 0:
                print("No project records found in database. Running automated seed...")
                from seed_data import seed_database
                seed_database()
        finally:
            db.close()
    except Exception as e:
        print("Error during init_db_if_needed:", e)

    _db_initialized = True

def get_db():
    init_db_if_needed()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
