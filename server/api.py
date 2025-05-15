from fastapi import FastAPI, Query
from fastapi import UploadFile, File, Form
from fastapi.responses import JSONResponse
import shutil
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
os.makedirs("runs/detect/predict", exist_ok=True)

app.mount("/output", StaticFiles(directory="runs/detect/predict"), name="output")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.post("/upload")
async def upload_image(camera_id: str = Form(...), file: UploadFile = File(...)):
    timestamp = datetime.now()
    filename = f"{timestamp.strftime('%Y%m%d-%H%M%S')}_{file.filename}"
    original_path = os.path.join(UPLOAD_DIR, filename)

    with open(original_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id FROM users WHERE cameraId = %s", (camera_id,))
    user = cursor.fetchone()

    if not user:
        return JSONResponse(content={"error": "Camera ID not found"}, status_code=400)
    

    cursor.execute("INSERT INTO images (userId, image) VALUES (%s, %s)", (user["id"], filename))
    db.commit()
    cursor.close()

    return JSONResponse(content={
        "message": "Image uploaded successfully",
        "filename": filename,
        "image_url": f"http://coopcounter.comdevelopment.com/uploads/{filename}"
    })

@app.get("/user/info")
def get_user_info(userId: int = Query(...)):
    cursor = db.cursor(dictionary=True)
    # Query the database for user information
    cursor.execute("SELECT * FROM users WHERE id = %s", (userId,))
    row = cursor.fetchall()
    cursor.close()

    if row:
        return JSONResponse(content=row)
    else:
        return JSONResponse(content={"error": "User not found"}, status_code=404)
    
@app.get("/user/images/latest")
def get_latest_user_image(userId: int = Query(...)):
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM images WHERE userId = %s AND ai_predicted_at IS NOT NULL ORDER BY uploaded_at DESC LIMIT 1", (userId,))
    row = cursor.fetchone()
    cursor.close()
    if not row:
        return JSONResponse(content={"error": "No predicted images found for this user"}, status_code=404)

    filename = row["image"]
    row["original_url"] = f"http://coopcounter.comdevelopment.com/uploads/{filename}"
    row["predicted_url"] = f"http://coopcounter.comdevelopment.com/output/{filename}"
    return row

@app.get("/user/images")
def get_user_images(userId: int = Query(...)):
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM images WHERE userId = %s ORDER BY uploaded_at DESC", (userId,))
    rows = cursor.fetchall()
    cursor.close()

    if not rows:
        return JSONResponse(content={"error": "No images found for this user"}, status_code=404)

    for row in rows:
        filename = row["image"]
        row["original_url"] = f"http://coopcounter.comdevelopment.com/uploads/{filename}"
        row["predicted_url"] = f"http://coopcounter.comdevelopment.com/output/{filename}"

    return rows

@app.get("/user/info/all")
def get_all_user_info():
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    cursor.close()

    if not rows:
        return JSONResponse(content={"error": "No users found"}, status_code=404)

    return rows