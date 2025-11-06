from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from app.database import get_db

router = APIRouter()

@router.get("/info")
def get_user_info(userId: int = Query(...)):
    """
    Get user information from the database for a given userId
    """
    # Connect to database
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # Query to get user information for userId from database
    cursor.execute("SELECT * FROM users WHERE id = %s", (userId,))
    # Fetch one result to see if it exists from database
    row = cursor.fetchone()
    # Commit changes
    db.commit()
    # Close cursor and connection
    cursor.close()
    db.close()

   # Return user info or error if not found
    if row:
        # return user info as JSON response
        return JSONResponse(content=row)
    else:
        # error if user not found
        return JSONResponse(content={"error": "User not found"}, status_code=404)