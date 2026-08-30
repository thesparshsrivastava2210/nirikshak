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
    
    # Check if DB file exists and is non-empty
    if not os.path.exists(DB_PATH) or os.path.getsize(DB_PATH) == 0:
        source_db = os.path.join(os.path.dirname(__file__), "nirikshak.db")
        if os.path.exists(source_db) and DB_PATH != source_db:
            try:
                shutil.copyfile(source_db, DB_PATH)
                _db_initialized = True
                return
            except Exception as e:
                print("Failed to copy source db to /tmp:", e)
        
        try:
            from seed_data import seed_database
            seed_database()
        except Exception as e:
            print("Failed to run seed_database:", e)

    _db_initialized = True

def get_db():
    init_db_if_needed()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
