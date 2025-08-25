from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from app.database import get_db
from app.config import settings

router = APIRouter()

@router.get("/latest")
def get_latest_user_image(userId: int = Query(...)):
    # Connect to database
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # Get the most recent image that has been processed by AI
    cursor.execute(
        "SELECT * FROM images WHERE userId = %s AND ai_predicted_at IS NOT NULL ORDER BY uploaded_at DESC LIMIT 1", 
        (userId,)
    )
    row = cursor.fetchone()
    db.commit()
    cursor.close()
    db.close()
    
    # Return error if no predicted images found
    if not row:
        return JSONResponse(content={"error": "No predicted images found for this user"}, status_code=404)

    # Add URLs for original and AI predicted images
    filename = row["image"]
    row["original_url"] = f"{settings.BASE_URL}/uploads/{filename}"
    row["predicted_url"] = f"{settings.BASE_URL}/output/{filename}"
    return row

@router.get("")
def get_user_images(userId: int = Query(...)):
    # Connect to database
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # Get all images for this user, newest first
    cursor.execute(
        "SELECT * FROM images WHERE userId = %s ORDER BY uploaded_at DESC", 
        (userId,)
    )
    rows = cursor.fetchall()
    db.commit()
    cursor.close()
    db.close()

    # Return error if no images found
    if not rows:
        return JSONResponse(content={"error": "No images found for this user"}, status_code=404)

    # Add URLs for each image
    for row in rows:
        filename = row["image"]
        row["original_url"] = f"{settings.BASE_URL}/uploads/{filename}"
        row["predicted_url"] = f"{settings.BASE_URL}/output/{filename}"

    return rows

@router.get("/hourly")
def get_images_hourly(userId: int = Query(...)):
    # Connect to database
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Calculate time range for last 24 hours
    now = datetime.now()
    since = now - timedelta(hours=24)

    # Get hourly averages of chicken count and certainty
    cursor.execute(
        "SELECT HOUR(uploaded_at) AS hour, AVG(chickenCount) AS avg_count, AVG(certainty) AS avg_certainty "
        "FROM images WHERE userId = %s AND chickenCount IS NOT NULL AND certainty IS NOT NULL "
        "AND uploaded_at >= %s GROUP BY HOUR(uploaded_at) ORDER BY hour ASC",
        (userId, since)
    )
    db_rows = cursor.fetchall()
    cursor.close()
    db.close()

    # Convert database results to dictionary for easy lookup
    hourly_data = {row["hour"]: row for row in db_rows}
    
    # Build results with all 24 hours and return averages
    result = []
    for h in range(24):
        if h in hourly_data:
            # Hour has data and return averages
            row = hourly_data[h]
            result.append({
                "chickenCount": round(row["avg_count"]),
                "certainty": round(row["avg_certainty"]),
                "time": f"{h:02}:00:00"
            })
        else:
            # No data for this hour and return zeros
            result.append({
                "chickenCount": 0,
                "certainty": 0,
                "time": f"{h:02}:00:00"
            })

    return result