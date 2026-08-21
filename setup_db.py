import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

try:
    conn = psycopg2.connect(dbname='postgres', user='postgres', host='localhost')
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    cursor.execute("CREATE DATABASE travelverse_ai;")
    print("Database created")
except Exception as e:
    print("Error:", e)
finally:
    if 'cursor' in locals(): cursor.close()
    if 'conn' in locals(): conn.close()

try:
    conn = psycopg2.connect(dbname='travelverse_ai', user='postgres', host='localhost')
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    print("Extension vector created")
except Exception as e:
    print("Error:", e)
finally:
    if 'cursor' in locals(): cursor.close()
    if 'conn' in locals(): conn.close()
