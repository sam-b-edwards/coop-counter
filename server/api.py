from fastapi import FastAPI, Query
from fastapi import UploadFile, File, Form
from fastapi.responses import JSONResponse
import shutil
from ultralytics import YOLO
from datetime import datetime
import os
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector

app = FastAPI()

db = mysql.connector.connect(
    host="localhost",
    user="admin",
    password="S5XF3koM93",
    database="coopcounter"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Serve the directory that YOLO saves prediction images into
app.mount("/output", StaticFiles(directory="runs/detect/predict"), name="output")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Load the model once when the server starts
model = YOLO("best.pt")

@app.get("/predict")
def predict_image():
    image_path = "images/IMG_5134.jpg"

    # Run detection
    results = model.predict(source=image_path, conf=0.2, save=True)

    for result in results:
        boxes = [box for box in result.boxes if model.names[int(box.cls)] == "Boiler-Chicken"]
        count = len(boxes)
        avg_conf = sum(box.conf[0].item() for box in boxes) / count if count > 0 else 0
        timestamp = datetime.now().isoformat()

        # Get the predicted image filename and public URL
        pred_filename = os.path.basename(image_path)
        public_url = f"/output/{pred_filename}"

        return {
            "count": count,
            "confidence_percent": round(avg_conf * 100, 1),
            "timestamp": timestamp,
            "predicted_image": public_url
        }

    return {"error": "No prediction result"}

@app.post("/upload")
async def upload_image(camera_id: str = Form(...), file: UploadFile = File(...)):
    timestamp = datetime.now()
    filename = f"{timestamp.strftime('%Y%m%d-%H%M%S')}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id FROM users WHERE cameraId = %s", (camera_id,))
    user = cursor.fetchone()

    if not user:
        return JSONResponse(content={"error": "Camera ID not found"}, status_code=400)
    
    results = model.predict(source=filepath, conf=0.2, save=True)

    count = 0
    avg_conf = 0
    
    for result in results:
        boxes = [box for box in result.boxes if model.names[int(box.cls)] == "Boiler-Chicken"]
        count = len(boxes)
        avg_conf = sum(box.conf[0].item() for box in boxes) / count if count > 0 else 0

    cursor.execute("INSERT INTO images (userId, image, date, timestamp, chickenCount, certainty) VALUES (%s, %s, %s, %s, %s, %s)", (user["id"], filename, timestamp.strftime("%Y-%m-%d"), timestamp.strftime("%H:%M:%S"), count, round(avg_conf * 100)))
    db.commit()
    cursor.close()
    db.close()
    return JSONResponse(content={"status": "received", "filename": filename})

@app.get("/user/info")
def get_user_info(userId: int = Query(...)):
    cursor = db.cursor(dictionary=True)
    # Query the database for user information
    cursor.execute("SELECT * FROM users WHERE id = %s", (userId,))
    row = cursor.fetchall()
    cursor.close()
    db.close()

    if row:
        return JSONResponse(content=row)
    else:
        return JSONResponse(content={"error": "User not found"}, status_code=404)
    