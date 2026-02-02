import os
import mysql.connector
from datetime import datetime
from services.config import get_config_value

def get_db_connection():
    """
    Parses DATABASE_URL and connects to MySQL.
    Format: mysql://[user]:[password]@[host]:[port]/[database]
    """
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found.")
        return None
    
    # Simple parsing logic (assuming mysql:// format)
    # Example: mysql://root:password@localhost:3306/voice_reservation
    try:
        url_parts = db_url.split("://")[1]
        credentials, location = url_parts.split("@")
        user, password = credentials.split(":")
        host_port, database = location.split("/")
        
        if ":" in host_port:
            host, port = host_port.split(":")
        else:
            host = host_port
            port = 3306

        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=int(port)
        )
        return conn
    except Exception as e:
        print(f"DB Connection Error: {e}")
        return None

def check_slot_availability(date_str: str, time_str: str) -> dict:
    """
    Checks if a reservation slot is available.
    - Operating Hours: 10 AM - 11 PM
    - Checks for conflicting reservations at the exact time.
    """
    
    # 1. Parse Inputs to validate format
    # Expect date_str: "DD-MM-YYYY" (standardized by LLM)
    # Expect time_str: "HH:MM AM/PM" (standardized by LLM)
    
    conn = get_db_connection()
    if not conn:
        return {"available": True, "reason": "System offline, assuming available."}

    try:
        cursor = conn.cursor(dictionary=True)
        
        # Parse input time once
        fmt_in = "%I:%M %p" # Expected input: 05:00 PM
        try:
            req_time_obj = datetime.strptime(time_str, fmt_in).time()
        except ValueError:
            # Fallback for simple formats like "5 PM" if strict parsing fails
            try:
                # Try adding :00 if missing
                clean_time = time_str.replace(" ", "").lower().replace("pm", " PM").replace("am", " AM")
                if ":" not in clean_time:
                     clean_time = clean_time.replace(" PM", ":00 PM").replace(" AM", ":00 AM")
                req_time_obj = datetime.strptime(clean_time, fmt_in).time()
            except:
                return {"available": True, "reason": "Time format unclear, checking skipped."}

        # Check existing reservations
        query = "SELECT time FROM Reservation WHERE date = %s"
        cursor.execute(query, (date_str,))
        reservations = cursor.fetchall()
        
        for r in reservations:
            db_time_str = r['time']
            try:
                db_time_obj = datetime.strptime(db_time_str, fmt_in).time()
                if db_time_obj == req_time_obj:
                     return {"available": False, "reason": f"Time {time_str} is already booked."}
            except ValueError:
                continue # Skip invalid DB times

        # 2. Check Operating Hours (10:00 AM - 11:00 PM)
        start_time = datetime.strptime("10:00 AM", fmt_in).time()
        end_time = datetime.strptime("11:00 PM", fmt_in).time()
        
        if not (start_time <= req_time_obj <= end_time):
                return {"available": False, "reason": f"Restaurant is closed at {time_str}. Open from 10:00 AM to 11:00 PM."}

        return {"available": True, "reason": "Slot is free."}
        
    except Exception as e:
        print(f"Availability Check Error: {e}")
        return {"available": True, "reason": "Check failed, assuming open."}
    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()
