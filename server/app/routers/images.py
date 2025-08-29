from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from app.database import get_db
from app.config import settings

router = APIRouter()

# Get the most recent image for a user
@router.get("/latest")
def get_latest_user_image(userId: int = Query(...)):
    """
    Get the most recent image for a user that has been processed by AI from the database
    """
    
    # Connect to database
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # Get the most recent image that has been processed by AI
    cursor.execute(
        "SELECT * FROM images WHERE userId = %s AND ai_predicted_at IS NOT NULL ORDER BY uploaded_at DESC LIMIT 1", 
        (userId,)
    )
    # Fetch one result to see if it exists
    row = cursor.fetchone()
    # Commit changes
    db.commit()
    # Close cursor and connection
    cursor.close()
    db.close()
    
    # Return error if no predicted images found
    if not row:
        return JSONResponse(content={"error": "No predicted images found for this user"}, status_code=404)

    # Add URLs for original and AI predicted images
    filename = row["image"]
    row["original_url"] = f"{settings.BASE_URL}/uploads/{filename}"
    row["predicted_url"] = f"{settings.BASE_URL}/output/{filename}"
    # Return the row with URLs
    return row

@router.get("")
def get_user_images(userId: int = Query(...)):
    """
    Get all images for a user from the database
    """

    # Connect to database
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # Get all images for this user, ordered by most recent first
    cursor.execute(
        "SELECT * FROM images WHERE userId = %s ORDER BY uploaded_at DESC", 
        (userId,)
    )
    # Fetch all results from database
    rows = cursor.fetchall()
    # Commit changes
    db.commit()
    # Close cursor and connection
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

    # Return the rows with URLs
    return rows


@router.get("/averages/hourly")
def get_averages_hourly(userId: int = Query(...), date: str = Query(None)):
    """
    Get average chicken count from past 24 hours or for a specific date of past 24 hours for a user from the database
    """

    # Connect to database
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Handle date parameter
    if date:
        # try and expect for valid date format
        try:
            # Convert the date string to a datetime object
            date_obj = datetime.strptime(date, "%Y-%m-%d")
        # raise error if invalid date format
        except ValueError:
            # close cursor and connection
            cursor.close()
            db.close()
            # Return error response
            return JSONResponse(content={"error": "Invalid date format. Use YYYY-MM-DD."}, status_code=400)
        
        # Get the start and end of the specified date
        since = datetime.combine(date_obj, datetime.min.time())y
        until = since + timedelta(days=1)
    else:
        # Get the past 24 hours from now instead
        until = datetime.now()
        since = until - timedelta(hours=24)

    # Get hourly averages of chicken count and certainty grouped by hour for the specified date or past 24 hours from now from database
    cursor.execute(
        "SELECT HOUR(uploaded_at) AS hour, AVG(chickenCount) AS avg_count, AVG(certainty) AS avg_certainty "
        "FROM images WHERE userId = %s AND chickenCount IS NOT NULL AND certainty IS NOT NULL "
        "AND uploaded_at >= %s AND uploaded_at < %s GROUP BY HOUR(uploaded_at) ORDER BY hour ASC",
        (userId, since, until)
    )
    # Fetch all results from database
    db_rows = cursor.fetchall()
    # Commit changes
    db.commit()
    # Close cursor and connection
    cursor.close()
    db.close()

    # Create dictionary with database results ordered by hour
    hourly_data = {row["hour"]: row for row in db_rows}
    
    # build result for each hour of the day from 0 to 23 with averages or zeros if no data for that hour from database
    # empty result list
    result = []
    # loop through each hour of the day
    for h in range(24):
        # Check if hour has data from database and add to result
        if h in hourly_data:
            # Hour has data and return averages
            row = hourly_data[h]
            # Append to result list
            result.append({
                "chickenCount": round(row["avg_count"]),
                "certainty": round(row["avg_certainty"]),
                "time": f"{h:02}:00:00"
            })
        else:
            # No data for this hour and append zeros
            result.append({
                "chickenCount": 0,
                "certainty": 0,
                "time": f"{h:02}:00:00"
            })
    
    # Return the result list with hourly averages or zeros if no data for that hour from database
    return result

@router.get("/averages/weekly")
def get_averages_weekly(userId: int = Query(...), date: str = Query(None)):
    """
    Get average chicken count for each day of the current week or a specific week for a user from the database
    """
    
    # Connect to database
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # Handle date parameter to get specific week or current week if not provided raises error for invalid date format
    if date:
        # try and expect for valid date format
        try:
            # Convert the date string to a datetime object
            date_obj = datetime.strptime(date, "%Y-%m-%d")
        # raise error if invalid date format
        except ValueError:
            # close cursor and connection
            cursor.close()
            db.close()
            # Return error response
            return JSONResponse(content={"error": "Invalid date format. Use YYYY-MM-DD."}, status_code=400)
        
        # Get the start of the week (Monday)
        since = date_obj - timedelta(days=date_obj.weekday())
        since = datetime.combine(since, datetime.min.time())
        # Get the end of the week
        until = since + timedelta(days=7)
    else:
        # Get current week
        until = datetime.now()
        since = until - timedelta(days=until.weekday())
        since = datetime.combine(since, datetime.min.time())
    
    # Get weekly averages grouped by day for the specified week or current week from database
    cursor.execute(
        "SELECT DATE(uploaded_at) AS date, AVG(chickenCount) AS avg_count, AVG(certainty) AS avg_certainty "
        "FROM images WHERE userId = %s AND chickenCount IS NOT NULL AND certainty IS NOT NULL "
        "AND uploaded_at >= %s AND uploaded_at < %s GROUP BY DATE(uploaded_at) ORDER BY date ASC",
        (userId, since, until)
    )
    # Fetch all results from database
    db_rows = cursor.fetchall()
    # Commit changes
    db.commit()
    # Close cursor and connection
    cursor.close()
    db.close()

    # Create dictionary with database results ordered by days of the week
    daily_data = {row["date"].strftime("%Y-%m-%d"): row for row in db_rows}
    
    # build result for each day of the week with averages or zeros if no data for that day from database
    # empty result list
    result = []
    # loop through each day of the week from since to until date from database
    current_date = since
    while current_date < until:
        date_str = current_date.strftime("%Y-%m-%d")
        # Check if date has data from database and add to result or zeros if no data for that date from database
        if date_str in daily_data:
            # Date has data and return averages
            row = daily_data[date_str]
            # Append to result list with day of the week
            result.append({
                "chickenCount": round(row["avg_count"]),
                "certainty": round(row["avg_certainty"]),
                "date": date_str,
                "dayOfWeek": current_date.strftime("%A")
            })
        else:
            # No data for this date and append zeros with day of the week to result list
            result.append({
                "chickenCount": 0,
                "certainty": 0,
                "date": date_str,
                "dayOfWeek": current_date.strftime("%A")
            })
        # Move to the next day
        current_date += timedelta(days=1)
    
    # Return the result list with daily averages or zeros if no data for that day of the week from database
    return result