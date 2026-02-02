from services.db import get_db_connection

conn = get_db_connection()
cursor = conn.cursor(dictionary=True)
cursor.execute("SELECT * FROM Reservation")
rows = cursor.fetchall()
print(f"Total Reservations: {len(rows)}")
for r in rows:
    print(f"ID: {r.get('id')} | Date: '{r.get('date')}' | Time: '{r.get('time')}'")
cursor.close()
conn.close()
