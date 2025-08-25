from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from app.database import get_db

router = APIRouter()

@router.get("/info")
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