import mysql.connector
from app.config import settings

def get_db():
    # Connect to MySQL database with settings from config
    return mysql.connector.connect(
        host=settings.DB_HOST,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        database=settings.DB_NAME
    )