from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.database import get_db
from app.auth import hash_password, verify_password
from app.avatar import generate_avatar, get_avatar
import random

router = APIRouter()

@router.post("/register")
async def register(data: dict):
    """Register a new user with hashed password and auto-generated camera ID"""
    
    # Turns JSON into dict
    # Converts email to lowercase
    email = data["email"].lower()
    password = data["password"]
    name = data["name"]
    # Default to 0 if not provided
    totalChickens = data.get("totalChickens", 0)
    
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
    
    # Generate avatar for new user
    avatar_filename = generate_avatar(name, user_id)
    
    return JSONResponse(content={
        "message": "User registered successfully",
        "userId": user_id,
        "cameraId": camera_id,
        "avatar": f"/avatars/{avatar_filename}" if avatar_filename else None
    })

@router.post("/login")
async def login(data: dict):
    """Login user and verify password"""
    
    # Extract values from dictionary at the top
    # Converts email to lowercase
    email = data["email"].lower()
    password = data["password"]
    
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
    
    # Get avatar or generate if doesn't exist
    avatar_filename = get_avatar(user['id'])
    if not avatar_filename:
        avatar_filename = generate_avatar(user.get('name', ''), user['id'])
    
    # Add avatar info to response
    if avatar_filename:
        user['icon'] = avatar_filename
        user['avatar'] = f"/avatars/{avatar_filename}"
    else:
        user['avatar'] = None
    
    return JSONResponse(content={
        "message": "Login successful",
        "user": user
    })