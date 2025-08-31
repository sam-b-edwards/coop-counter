from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, HTTPException
from fastapi.responses import JSONResponse
import json
from app import streaming
from app.database import get_db

router = APIRouter()

@router.websocket("/push")
async def camera_push_stream(websocket: WebSocket):
    """
    WebSocket endpoint for cameras to push their video stream
    """

    # Accept the WebSocket connection
    await websocket.accept()

    # try to initialize camera stream
    try:
        # Wait for authentication message from camera
        auth_data = await websocket.receive_text()
        # json parse the authentication message
        auth_msg = json.loads(auth_data)

        # Check if authentication message is valid and type is "auth"
        if auth_msg.get("type") != "auth":
            # if not, send error response and close connection
            await websocket.send_text(json.dumps({
                "status": "error",
                "message": "Authentication required"
            }))
            await websocket.close(code=4001, reason="Authentication required")
            return

        # get camera ID from auth message
        camera_id = auth_msg.get("camera_id")

        # if does not get camera ID, sends error response and closes connection
        if not camera_id:
            await websocket.send_text(json.dumps({
                "status": "error",
                "message": "Camera ID required"
            }))
            await websocket.close(code=4002, reason="Camera ID required")
            return

        # get db connection
        db = get_db()
        cursor = db.cursor(dictionary=True)
        # Verify camera ID exists in database
        cursor.execute("SELECT id FROM users WHERE cameraId = %s", (camera_id,))
        # fetch result of camera ID exists
        result = cursor.fetchone()
        # close cursor and db connection
        cursor.close()
        db.close()

        # if camera ID does not exist in database, send error message and close connection
        if not result:
            await websocket.send_text(json.dumps({
                "status": "error",
                "message": "Invalid camera ID"
            }))
            await websocket.close(code=4003, reason="Invalid camera ID")
            return

        # Send authentication success in json format
        await websocket.send_text(json.dumps({
            "status": "authenticated",
            "message": "Camera authenticated successfully"
        }))

        # Handle camera stream
        await streaming.handle_camera_connection(websocket, camera_id)

    # Handle websocket disconnection error messages
    except WebSocketDisconnect:
        print("Camera disconnected during authentication")
    # Handle other errors
    except Exception as error:
        print(f"Error in camera push stream: {error}")
        await websocket.close(code=4000, reason="Server error")

@router.websocket("/watch/{camera_id}")
async def client_watch_stream(websocket: WebSocket, camera_id: str, user_id: int = Query(...)):
    """
    WebSocket endpoint for clients to watch a camera stream
    """
    try:
        # Handle client connection with user authentication function
        await streaming.handle_client_connection(websocket, camera_id, user_id)

    # Handle unexpected errors and closes websocket connection
    except Exception as error:
        print(f"Error in client watch stream: {error}")
        await websocket.close(code=4000, reason="Server error")

@router.get("/status/{camera_id}")
def get_stream_status(camera_id: str, user_id: int = Query(...)):
    """
    Get the current status of a camera stream
    """
    # get db connection
    db = get_db()
    cursor = db.cursor(dictionary=True)
    # query to check if user has access to this camera and camera exists
    cursor.execute(
        "SELECT id FROM users WHERE id = %s AND cameraId = %s",
        (user_id, camera_id)
    )
    # fetch result of user camera access
    result = cursor.fetchone()
    # close cursor and db connection
    cursor.close()
    db.close()

    # error handling if user does not have access to this camera and camera exists
    if not result:
        raise HTTPException(status_code=403, detail="Unauthorized to view this camera")
    
    # Get stream status
    status = streaming.get_stream_status(camera_id)
    # returns stream status in json format
    return JSONResponse(content=status)

@router.get("/active")
def get_active_streams():
    """
    Get list of all currently active camera streams
    """
    # Get active streams
    active_streams = streaming.get_all_active_streams()
    # returns active streams in json format
    return JSONResponse(content={"active_streams": active_streams})