"""
Reminder to add to write up using dictionary instead of database to store each cameras information because websockets can not be stored in a database.
Also explain how websocket works with FastAPI
"""
from fastapi import WebSocket, WebSocketDisconnect
import json
import asyncio
import time
from app.database import get_db

# Store streams by camera_id
camera_streams: dict[str, dict] = {}

# Configuration constant
# Keep last 30 frames in buffer for each camera
MAX_BUFFER_SIZE = 30

def create_stream_dict():
    """
    Create a new stream dictionary with default values
    """
    # dictionary to hold stream information for each camera
    return {
        "frames": [],
        "clients": [],
        "last_frame_time": None,
        "camera_websocket": None,
        "is_streaming": False
    }

async def handle_camera_connection(websocket: WebSocket, camera_id: str):
    """
    Handle incoming stream from a camera device
    """
    # Initialize stream dict if it doesn't exist
    if camera_id not in camera_streams:
        camera_streams[camera_id] = create_stream_dict()

    # Get the stream information for the camera
    stream = camera_streams[camera_id]
    
    # Close existing camera connection if any
    if stream["camera_websocket"]:
        # try and except to handle closing websocket
        try:
            # Close the existing websocket connection
            await stream["camera_websocket"].close()
        except:
            # continues if closing websocket fails
            pass

    # Set the new websocket connection
    stream["camera_websocket"] = websocket
    stream["is_streaming"] = True

    # print connection status
    print(f"Camera {camera_id} connected and streaming")

    # try and except to handle receiving data from camera
    try:
        # loop to keep receiving data from camera
        while True:
            # Receive frame data from camera
            data = await websocket.receive_text()
            # Parse json message
            message = json.loads(data)

            # Debug: Log ANY message received
            if message.get("frame_number", 0) % 50 == 0 or message["type"] != "frame":
                print(f"Camera {camera_id} received message type: {message.get('type', 'unknown')}, frame_number: {message.get('frame_number', 'N/A')}")

            # Check if message is a frame type
            if message["type"] == "frame":
                # Update stream info with new frame data
                stream["last_frame_time"] = time.time()

                # store latest frame data in circular buffer
                frame_data = {
                    "data": message["data"],
                    "timestamp": message.get("timestamp", time.time()),
                    "frame_number": message.get("frame_number", 0)
                }

                # Debug: Log frame reception
                # log every 50 frames
                if frame_data.get("frame_number", 0) % 50 == 0:
                    print(f"Camera {camera_id} received frame {frame_data.get('frame_number', 'unknown')}, buffer size: {len(stream['frames'])}, clients: {len(stream['clients'])}")

                # append frame data to circular buffer
                stream["frames"].append(frame_data)

                # Keep only the most recent frames in the buffer
                if len(stream["frames"]) > MAX_BUFFER_SIZE:
                    # Remove oldest frame
                    stream["frames"].pop(0)

                # Broadcast to all watching clients
                await broadcast_to_clients(camera_id, frame_data)

    # expect to handle websocket disconnection
    except WebSocketDisconnect:
        # print disconnection status
        print(f"Camera {camera_id} disconnected")
        # disconnects camera websocket
        stream["is_streaming"] = False
        stream["camera_websocket"] = None
        
        # Notify clients that stream has ended
        await notify_clients_stream_ended(camera_id)

    # expect to handle unexpected errors
    except Exception as error:
        # print error message
        print(f"Error in camera stream {camera_id}: {error}")
        # sets streaming status to false and disconnects camera websocket
        stream["is_streaming"] = False
        stream["camera_websocket"] = None

async def handle_client_connection(websocket: WebSocket, camera_id: str, user_id: int):
    """
    Handle a client (React Native app) watching a camera stream
    """
    
    # Verify user has access to this camera 
    if not await verify_camera_access(user_id, camera_id):
        # If not, close the websocket connection
        await websocket.close(code=4003, reason="Unauthorized")
        return

    # Accept the websocket connection
    await websocket.accept()
    
    # Initialize stream dict if it doesn't exist
    if camera_id not in camera_streams:
        camera_streams[camera_id] = create_stream_dict()

    # Get the stream info
    stream = camera_streams[camera_id]
    # Add the websocket to the list of clients connected to this stream
    stream["clients"].append(websocket)

    # prints which user is connected to which camera
    print(f"Client {user_id} connected to watch camera {camera_id}")
    
    # try to handle sending data to client
    try:
        # send stream status in json format
        await websocket.send_text(json.dumps({
            "type": "status",
            "is_streaming": stream["is_streaming"],
            "buffer_size": len(stream["frames"])
        }))

        # Send buffered frames to give instant preview to client
        if stream["frames"]:
            # Send last 5 frames for instant preview
            recent_frames = stream["frames"][-5:]
            # Send each frame to the client
            for frame in recent_frames:
                # sends it in json format
                await websocket.send_text(json.dumps({
                    "type": "frame",
                    "data": frame["data"],
                    "timestamp": frame["timestamp"],
                    "frame_number": frame["frame_number"]
                }))

        # using loop to keep connection alive with ping/pong
        while True:
            # try, expect, finally to receive messages from client and send them back and handle errors and remove client from stream
            try:
                # Wait for any message from client to keep connection alive
                message = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=30.0
                )
                
                # Handle client messages if needed
                client_msg = json.loads(message)
                # if client message is a ping, send pong to keep-alive
                if client_msg.get("type") == "ping":
                    # send pong in json format
                    await websocket.send_text(json.dumps({"type": "pong"}))

            # expect to handle unexpected errors if no message is received
            except asyncio.TimeoutError:
                # Send ping to check if client is still connected
                await websocket.send_text(json.dumps({"type": "ping"}))

    # expect to handle unexpected errors if websocket is closed
    except WebSocketDisconnect:
        # print disconnection message
        print(f"Client {user_id} disconnected from camera {camera_id}")

    # expect to handle unexpected errors if no message is received
    except Exception as error:
        print(f"Error with client {user_id}: {error}")

    # finally to remove client from stream dict
    finally:
        # Remove client from list
        if websocket in stream["clients"]:
            stream["clients"].remove(websocket)

async def broadcast_to_clients(camera_id: str, frame_data: dict):
    """
    Send frame to all clients watching this camera
    """
    # Skip if camera not in streams
    if camera_id not in camera_streams:
        return

    # Get the stream info
    stream = camera_streams[camera_id]
    # Copy to avoid modification during iteration
    clients = stream["clients"].copy()

    # Skip if no clients are connected
    if not clients:
        return

    # Debug: Log broadcasting attempt
    print(f"Broadcasting frame {frame_data.get('frame_number', 'unknown')} to {len(clients)} clients for camera {camera_id}")

    # Prepare the message in json format
    message = json.dumps({
        "type": "frame",
        "data": frame_data["data"],
        "timestamp": frame_data["timestamp"],
        "frame_number": frame_data["frame_number"]
    })

    # Sends json message to all clients
    # creates a empty list to track disconnected clients that did not receive the message
    disconnected = []
    # loop through all clients and send message frame
    for client in clients:
        # try and expect to send json message and track disconnected clients that did not recieve message
        try:
            # send the json message frame
            await client.send_text(message)
        except:
            # Track disconnected clients that did not receive json message frame
            disconnected.append(client)

    # using loop to remove disconnected clients from the stream
    for client in disconnected:
        # Remove disconnected clients from the stream dict
        if client in stream["clients"]:
            stream["clients"].remove(client)

async def notify_clients_stream_ended(camera_id: str):
    """
    Notify all clients that the camera stream has ended
    """
    # Skip if camera not in streams
    if camera_id not in camera_streams:
        return

    # Get the stream info
    stream = camera_streams[camera_id]
    # Prepare the message in json format
    message = json.dumps({
        "type": "stream_ended",
        "message": "Camera stream has ended"
    })

    # creates a empty list to track disconnected clients that did not receive the message
    disconnected = []
    # loop through all clients and sends notification to each client about the stream ended
    for client in stream["clients"].copy():
        # try to send the notification message to each client
        try:
            await client.send_text(message)
        # track disconnected clients that did not receive the notification message
        except:
            disconnected.append(client)

    # using loop to remove disconnected clients that did not receive the notification message from the stream dict
    for client in disconnected:
        # Remove disconnected clients from the stream dict
        if client in stream["clients"]:
            stream["clients"].remove(client)

async def verify_camera_access(user_id: int, camera_id: str) -> bool:
    """
    Verify that the user has access to view this camera
    """

    # Get database connection
    db = get_db()
    cursor = db.cursor(dictionary=True)

    # try and except to check if user has access to this camera and if camera exists and sends error message
    try:
        # execute query to check if user has camera access and if camera exists
        cursor.execute(
            "SELECT id FROM users WHERE id = %s AND cameraId = %s",
            (user_id, camera_id)
        )
        # fetches the result
        result = cursor.fetchone()

        # Close cursor and database connection
        cursor.close()
        db.close()

        # returns query result and not None if user has camera access
        return result is not None

    # error response if user does not have access to this camera
    except Exception as error:
        # print error message
        print(f"Error verifying camera access: {error}")
        # close cursor and database connection
        cursor.close()
        db.close()
        # return False if user does not have access to this camera
        return False

def get_stream_status(camera_id: str) -> dict:
    """
    Get current status of a camera stream
    """
    # Get the stream info for the specified camera
    stream = camera_streams.get(camera_id)
    # check if stream is active and returns error if not running
    if not stream:
        return {
            "is_streaming": False,
            "clients_connected": 0,
            "buffer_size": 0
        }

    # If stream is active, return its status
    return {
        "is_streaming": stream["is_streaming"],
        "clients_connected": len(stream["clients"]),
        "buffer_size": len(stream["frames"]),
        "last_frame_time": stream["last_frame_time"]
    }

def get_all_active_streams() -> list:
    """
    Get list of all currently active camera streams
    """
    # creates a empty list to hold active streams
    active_streams = []
    # loop through all camera streams
    for camera_id, stream in camera_streams.items():
        # Check if stream is active and update active streams list with active streams
        if stream["is_streaming"]:
            active_streams.append({
                "camera_id": camera_id,
                "clients_connected": len(stream["clients"]),
                "buffer_size": len(stream["frames"]),
                "last_frame_time": stream["last_frame_time"]
            })
    # Return the list of active streams
    return active_streams