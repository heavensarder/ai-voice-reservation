import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

# Use the same DB URL as frontend, but adapted for Python (if needed)
# Frontend: mysql://root:@localhost:3306/ai-voice-reservation
# Python: mysql+pymysql://root:@localhost:3306/ai-voice-reservation
DB_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/ai-voice-reservation")

try:
    engine = create_engine(DB_URL)
except Exception as e:
    print(f"DB Engine Error: {e}")
    engine = None

def get_config_value(key: str, default: str = "") -> str:
    """
    Fetches a config value from the SystemConfig table.
    Falls back to environment variable or default.
    """
    # 1. Check DB
    if engine:
        try:
            with engine.connect() as conn:
                # Specify textual SQL
                print(f"DEBUG: Querying DB for key: {key}")
                result = conn.execute(text("SELECT value FROM SystemConfig WHERE `key` = :key"), {"key": key})
                row = result.fetchone()
                if row:
                    print(f"DEBUG: Found key {key} in DB: {row[0][:5]}...")
                    return row[0]
                else:
                    print(f"DEBUG: Key {key} NOT found in DB")
        except Exception as e:
            print(f"DB Config API Error: {e}")
    else:
        print("DEBUG: DB Engine is None")
    
    # 2. Fallback to Env
    val = os.getenv(key, default)
    if val:
        print(f"DEBUG: Found key {key} in Env")
    return val
