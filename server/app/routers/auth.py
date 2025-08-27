from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.database import get_db
from app.auth import hash_password, verify_password
import random

router = APIRouter()

@router.post("/register")
async def register(
    email: str,
    password: str,
    name: str,
    totalChickens: int = 0
):
    """Register a new user with hashed password and auto-generated camera ID"""
    
    # Connect to database
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # Check if email already exists
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    existing_user = cursor.fetchone()
    
    if existing_user:
        cursor.close()
        db.close()
        return JSONResponse(content={"error": "Email already registered"}, status_code=400)
    
    # Generate random 5-digit camera ID
    camera_id = str(random.randint(10000, 99999))
    
    # Hash the password
    hashed_password = hash_password(password)
    
    # Insert new user with unique camera ID
    cursor.execute(
        "INSERT INTO users (email, password, name, cameraId, totalChickens) VALUES (%s, %s, %s, %s, %s)",
        (email, hashed_password, name, camera_id, totalChickens)
    )
    db.commit()
    
    # Get the new user's ID
    user_id = cursor.lastrowid
    
    cursor.close()
    db.close()
    
    return JSONResponse(content={
        "message": "User registered successfully",
        "userId": user_id,
        "cameraId": camera_id
    })

@router.post("/login")
async def login(
    email: str,
    password: str
):
    """Login user and verify password"""
    
    # Connect to database
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # Get user by email
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    
    cursor.close()
    db.close()
    
    # Check if user exists
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Remove password from response
    user.pop('password', None)
    
    return JSONResponse(content={
        "message": "Login successful",
        "user": user
    })