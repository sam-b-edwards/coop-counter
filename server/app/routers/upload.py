from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
import shutil
from datetime import datetime
import os
from app.database import get_db
from app.config import settings

router = APIRouter()

@router.post("/upload")
async def upload_image(camera_id: str = Form(...), file: UploadFile = File(...)):
    
    # Generate timestamp filename for uploaded image
    timestamp = datetime.now()
    filename = f"{timestamp.strftime('%Y%m%d-%H%M%S')}_{file.filename}"
    original_path = os.path.join(settings.UPLOAD_DIR, filename)

    # Save the uploaded file to uploads directory
    with open(original_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Connect to database and find user by camera ID
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id FROM users WHERE cameraId = %s", (camera_id,))
    user = cursor.fetchone()

    # Return error if camera ID not found
    if not user:
        return JSONResponse(content={"error": "Camera ID not found"}, status_code=400)
    
    # Insert image record into database
    cursor.execute("INSERT INTO images (userId, image) VALUES (%s, %s)", (user["id"], filename))
    db.commit()
    cursor.close()
    db.close()

    # Return success response with image URL
    return JSONResponse(content={
        "message": "Image uploaded successfully",
        "filename": filename,
        "image_url": f"{settings.BASE_URL}/uploads/{filename}"
    })