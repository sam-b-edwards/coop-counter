from fastapi import FastAPI, Query
from fastapi import UploadFile, File, Form
from fastapi.responses import JSONResponse
import shutil
from datetime import datetime, timedelta
import os
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector

app = FastAPI()

def get_db():
    return mysql.connector.connect(
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
    
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT id FROM users WHERE cameraId = %s", (camera_id,))
    user = cursor.fetchone()

    if not user:
        return JSONResponse(content={"error": "Camera ID not found"}, status_code=400)
    

    cursor.execute("INSERT INTO images (userId, image) VALUES (%s, %s)", (user["id"], filename))
    db.commit()
    cursor.close()
    db.close()

    return JSONResponse(content={
        "message": "Image uploaded successfully",
        "filename": filename,
        "image_url": f"http://coopcounter.comdevelopment.com/uploads/{filename}"
    })

@app.get("/user/info")
def get_user_info(userId: int = Query(...)):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    # Query the database for user information
    cursor.execute("SELECT * FROM users WHERE id = %s", (userId,))
    row = cursor.fetchone()
    db.commit()
    cursor.close()
    db.close()

    if row:
        return JSONResponse(content=row)
    else:
        return JSONResponse(content={"error": "User not found"}, status_code=404)
    
@app.get("/user/images/latest")
def get_latest_user_image(userId: int = Query(...)):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM images WHERE userId = %s AND ai_predicted_at IS NOT NULL ORDER BY uploaded_at DESC LIMIT 1", (userId,))
    row = cursor.fetchone()
    db.commit()
    cursor.close()
    db.close()
    if not row:
        return JSONResponse(content={"error": "No predicted images found for this user"}, status_code=404)

    filename = row["image"]
    row["original_url"] = f"http://coopcounter.comdevelopment.com/uploads/{filename}"
    row["predicted_url"] = f"http://coopcounter.comdevelopment.com/output/{filename}"
    return row

@app.get("/user/images")
def get_user_images(userId: int = Query(...)):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM images WHERE userId = %s ORDER BY uploaded_at DESC", (userId,))
    rows = cursor.fetchall()
    db.commit()
    cursor.close()
    db.close()

    if not rows:
        return JSONResponse(content={"error": "No images found for this user"}, status_code=404)

    for row in rows:
        filename = row["image"]
        row["original_url"] = f"http://coopcounter.comdevelopment.com/uploads/{filename}"
        row["predicted_url"] = f"http://coopcounter.comdevelopment.com/output/{filename}"

    return rows

@app.get("/user/images/hourly")
def get_images_hourly(userId: int = Query(...), date: str = Query(None)):
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # date handling
    if date:
        # Validate the date format
        try:
            # Convert the date string to a datetime object
            date_obj = datetime.strptime(date, "%Y-%m-%d")
        # Handle invalid date format
        except ValueError:
            # Close the cursor and database connection before returning an error
            cursor.close()
            db.close()
            # Return an error response
            return JSONResponse(content={"error": "Invalid date format. Use YYYY-MM-DD."}, status_code=400)
        # Set the time range for the query
        since = datetime.combine(date_obj, datetime.min.time())
        # Get the end of the day
        until = since + timedelta(days=1)
    # if no user date provided then set to last 24 hours
    else:
        until = datetime.now()
        since = until - timedelta(hours=24)

    cursor.execute(
        "SELECT HOUR(uploaded_at) AS hour, AVG(chickenCount) AS avg_count, AVG(certainty) AS avg_certainty "
        "FROM images WHERE userId = %s AND chickenCount IS NOT NULL AND certainty IS NOT NULL "
        "AND uploaded_at >= %s AND uploaded_at < %s GROUP BY HOUR(uploaded_at) ORDER BY hour ASC",
        (userId, since, until)
    )
    db_rows = cursor.fetchall()
    cursor.close()
    db.close()

    hourly_data = {row["hour"]: row for row in db_rows}

    result = []
    for h in range(24):
        if h in hourly_data:
            row = hourly_data[h]
            result.append({
                "chickenCount": round(row["avg_count"]),
                "certainty": round(row["avg_certainty"]),
                "time": f"{h:02}:00:00"
            })
        else:
            result.append({
                "chickenCount": 0,
                "certainty": 0,
                "time": f"{h:02}:00:00"
            })

    return result