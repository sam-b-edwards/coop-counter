from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import shutil
from datetime import datetime
import os
from app.database import get_db
from app.config import settings
from ultralytics import YOLO

# Create API router instance
router = APIRouter()

BASE_DIR = "/home/sam/counting-chickens/server"
MODEL_PATH = f"{BASE_DIR}/best.pt"
model = YOLO(MODEL_PATH)


@router.post("/predict")
async def predict(user_id: str = Form(...), file: UploadFile = File(...)):
    """
    Run AI prediction on uploaded image immediately and save to database
    Same logic as predict.py but instant results for mobile app
    """

    # Create unique filename
    timestamp = datetime.now()
    filename = f"{timestamp.strftime('%Y%m%d-%H%M%S')}_{user_id}_{file.filename}"
    image_path = os.path.join(settings.UPLOAD_DIR, filename)

    try:
        # Save uploaded file temporarily
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"Predicting image: {filename}")

        # predicts the image using the YOLO model
        results = model.predict(
            source=image_path,
            conf=0.1,
            save=True,
            project=f"{BASE_DIR}/runs/detect",
            name="predict",
            exist_ok=True
        )

        # variables to store the chicken count and average confidence for the image
        count = 0
        avg_conf = 0.0

        for result in results:
            boxes = [box for box in result.boxes if model.names[int(box.cls)] == "Boiler-Chicken"]
            count = len(boxes)
            if count > 0:
                avg_conf = sum(box.conf[0].item() for box in boxes) / count
            
        # Save to database
        db = get_db()
        cursor = db.cursor(dictionary=True)

        try:
            # Verify user exists
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()

            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            # Insert image record with AI results (same as predict.py)
            cursor.execute(
                "INSERT INTO images (userId, image, chickenCount, certainty, ai_predicted_at) VALUES (%s, %s, %s, %s, %s)",
                (user_id, filename, count, round(avg_conf * 100), timestamp)
            )
            db.commit()

            image_id = cursor.lastrowid
            print(f"Updated image {image_id} with chicken count: {count} and certainty: {round(avg_conf * 100)}%")

        except Exception as db_error:
            print(f"Database error: {db_error}")
            cursor.close()
            db.close()
            raise HTTPException(status_code=500, detail="Failed to save to database")

        cursor.close()
        db.close()

        # Prepare response
        response_data = {
            "success": True,
            "chicken_count": count,
            "confidence": round(avg_conf * 100),
            "image_upload_url": f"{settings.BASE_URL}/uploads/{filename}",
            "image_predicted_url": f"{settings.BASE_URL}/output/{filename}",
            "image_id": image_id,
            "timestamp": timestamp.isoformat()
        }

        return JSONResponse(content=response_data)

    except Exception as error:
        # Clean up temp file on error
        if os.path.exists(image_path):
            os.remove(image_path)

        print(f"Error processing image: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to process image: {error}")