
import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

db_url = os.environ.get('DATABASE_URL')
print(f"Checking connection to: {db_url}")

try:
    conn = psycopg2.connect(db_url)
    print("Connection successful!")
    conn.close()
except Exception as e:
    print(f"Connection failed: {e}")
