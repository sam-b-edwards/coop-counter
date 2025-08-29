from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.database import get_db
from app.auth import hash_password, verify_password
from app.avatar import generate_avatar, get_avatar
import random

# Create API router instance
router = APIRouter()

def choose_camera_id() -> int:
    """
    Generate a unique 5-digit camera ID not already in use in the database
    """
    # Connect to database
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # Keep generating until a unique ID is found
    while True:
        # Generate random 5-digit number
        camera_id = random.randint(10000, 99999)

        # Check if this camera ID already exists in the database
        cursor.execute("SELECT id FROM users WHERE cameraId = %s", (camera_id,))
        # Fetch one result to see if it exists
        existing_user_with_camera_id = cursor.fetchone()
        
        # if not found existing camera id then returns the new unique camera id
        if not existing_user_with_camera_id:
            # Close cursor and connection
            cursor.close()
            db.close()
            # Return the new unique camera ID
            return camera_id
    

@router.post("/register")
async def register(data: dict):
    """
    Register a new user with hashed password and auto-generated camera ID
    """

    # Turns JSON into dict
    # Converts email to lowercase
    email = data["email"].lower()
    # Strip spaces from password
    password = data["password"].strip()
    # Ensure password is not empty
    if password == "":
        # Return error response
        return JSONResponse(content={"error": "Please provide a password"}, status_code=400)
    
    # name and totalChickens dict values
    name = data["name"]
    # Default to 0 if not provided
    totalChickens = data.get("totalChickens", 0)
    
    # Connect to database
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # Check if email already exists
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    # Fetch one result to see if email exists
    existing_user = cursor.fetchone()
    
    # If email exists, return error response
    if existing_user:
        # Close cursor and connection
        cursor.close()
        db.close()
        # return error response
        return JSONResponse(content={"error": "Email already registered"}, status_code=400)
    
    # Generate random 5-digit camera ID
    camera_id = choose_camera_id()
    
    # Hash the password
    hashed_password = hash_password(password)
    
    # Insert new user with unique camera ID
    cursor.execute(
        "INSERT INTO users (email, password, name, cameraId, totalChickens) VALUES (%s, %s, %s, %s, %s)",
        (email, hashed_password, name, camera_id, totalChickens)
    )
    # Commit changes
    db.commit()
    
    # Get the new user's ID
    user_id = cursor.lastrowid
    
    # Close cursor and connection
    cursor.close()
    db.close()
    
    # Generate avatar for new user
    avatar_filename = generate_avatar(name, user_id)
    
    # Return success response with user ID, camera ID, and avatar info
    return JSONResponse(content={
        "message": "User registered successfully",
        "userId": user_id,
        "cameraId": camera_id,
        "avatar": f"/avatars/{avatar_filename}" if avatar_filename else None
    })

@router.post("/login")
async def login(data: dict):
    """
    Authenticate user and return user details with avatar info
    """
    
    # Extract values from dictionary at the top
    # Converts email to lowercase
    email = data["email"].lower()
    password = data["password"]
    
    # Connect to database
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # get user by email from database
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    # Fetch one result to see if user exists
    user = cursor.fetchone()

    # Closes cursor and connection
    cursor.close()
    db.close()
    
    # Check if user exists
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password using bcrypt
    # If password does not match, raise error
    if not verify_password(password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Remove password from user dict before returning response to prevent exposure
    user.pop('password', None)
    
    # Get avatar or generate if doesn't exist
    avatar_filename = get_avatar(user['id'])
    if not avatar_filename:
        avatar_filename = generate_avatar(user.get('name', ''), user['id'])
    
    # Add avatar URL to user dict if exists
    if avatar_filename:
        user['avatar'] = f"/avatars/{avatar_filename}"
    else:
        user['avatar'] = None
    
    # Return success response with user details
    return JSONResponse(content={
        "message": "Login successful",
        "user": user
    })