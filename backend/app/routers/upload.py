from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
import shutil
from datetime import datetime
import os
from app.database import get_db
from app.config import settings

# Create API router instance
router = APIRouter()

@router.post("/upload")
async def upload_image(camera_id: str = Form(...), file: UploadFile = File(...)):
    """
    Upload an image for a user identified by camera ID and save to uploads directory and database from React Native app
    """
    
    # get current timestamp for filenaming
    timestamp = datetime.now()
    # Create unique filename with timestamp and original filename
    filename = f"{timestamp.strftime('%Y%m%d-%H%M%S')}_{file.filename}"
    # Full path for saving the uploaded file to uploads directory
    original_path = os.path.join(settings.UPLOAD_DIR, filename)

    # Save the uploaded file to the uploads directory
    with open(original_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Connect to database to find user by camera ID
    db = get_db()
    cursor = db.cursor(dictionary=True)
    # Find user by camera ID in database
    cursor.execute("SELECT id FROM users WHERE cameraId = %s", (camera_id,))
    # Fetch one result to see if it exists
    user = cursor.fetchone()

    # Return error if camera ID not found
    if not user:
        return JSONResponse(content={"error": "Camera ID not found"}, status_code=400)

    # Insert image directory into database linked to user ID
    cursor.execute("INSERT INTO images (userId, image) VALUES (%s, %s)", (user["id"], filename))
    # Commit changes
    db.commit()
    # Close cursor and connection
    cursor.close()
    db.close()

    # Return success response with image URL
    return JSONResponse(content={
        "message": "Image uploaded successfully",
        "filename": filename,
        "image_url": f"{settings.BASE_URL}/uploads/{filename}"
    })