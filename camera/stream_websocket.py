import asyncio
import websockets
import cv2
import base64
import json
import os
import time
import requests
from datetime import datetime
from picamera2 import Picamera2

# Configuration constants
ID_FILE = '/home/sam/ID.txt'
# WebSocket server URL
SERVER_URL = "ws://coopcounter.comdevelopment.com/ws/stream/push"
# Upload endpoint
UPLOAD_URL = "http://coopcounter.comdevelopment.com/upload"
# Video stream configuration
# Reduced resolution for more stable streaming (half resolution)
FRAME_WIDTH = 2304
FRAME_HEIGHT = 1296
FPS = 10
# Lower quality for faster transmission
JPEG_QUALITY = 50
# Capture interval in seconds (5 minutes = 300 seconds)
CAPTURE_INTERVAL = 300

def capture_and_upload_image(frame, camera_id):
    """
    Capture current frame and upload to server
    """
    try:
        # Create a temporary file for the captured image
        filename = "/tmp/capture.jpg"
        
        # Encode frame as JPEG
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 90])

        # Save to temporary file
        with open(filename, 'wb') as f:
            f.write(buffer)
        print("Image captured.")

        # try and expects to upload frame via API and handle response
        try:
            with open(filename, "rb") as f:
                response = requests.post(
                    UPLOAD_URL, 
                    files={"file": f}, 
                    data={"camera_id": camera_id},
                    timeout=10
                )
                print("Uploaded frame to server successfully")
                print("Uploaded Server response:", response.json())
        # handle error response
        except Exception as upload_error:
            print(f"Upload error: {upload_error}")
    # handle unexpected errors
    except Exception as error:
        print(f"Capture error: {error}")

async def capture_task(picam, camera_id):
    """
    Separate task to capture and upload images every 5 minutes
    """
    # Wait for camera to warm up
    await asyncio.sleep(10)

    # while loop for continuous capture every 5 minutes
    while True:
        # try and expects to capture frame and upload image and handle errors
        try:
            print(f"Starting scheduled capture")
            # Capture frame directly from camera
            frame = picam.capture_array()
            capture_and_upload_image(frame, camera_id)
            print(f"Next capture in {CAPTURE_INTERVAL} seconds")
        except Exception as error:
            print(f"Error during capture: {error}")

        # Wait for next capture interval
        await asyncio.sleep(CAPTURE_INTERVAL)

async def stream_to_server_with_camera(picam, camera_id):
    """
    Connect to the WebSocket server and stream video frames using provided camera
    """
    print(f"Camera ID: {camera_id}")
    print(f"Connecting to server: {SERVER_URL}")

    # Frame timing
    frame_interval = 1.0 / FPS

    # loops to maintain connection to websocket
    while True:
        # Attempt to connect to websocket
        try:
            print(f"Attempting to connect to {SERVER_URL}...")

            # Connect to websocket with more tolerant timeouts for slow connections
            async with websockets.connect(
                SERVER_URL,
                # Increased from 10 to give more time between pings
                ping_interval=20,
                # Increased from 5 to allow slower responses
                ping_timeout=10,
                # Increased for better stability
                close_timeout=10,
            ) as websocket:
                
                print("Connected! Sending authentication...")
                
                # Send authentication message
                auth_message = {
                    "type": "auth",
                    "camera_id": camera_id
                }
                # Send authentication message as JSON
                await websocket.send(json.dumps(auth_message))

                # Wait for authentication response
                response = await websocket.recv()
                # Parse JSON response
                auth_response = json.loads(response)

                # Check if authentication succeeded
                if auth_response.get("status") == "authenticated":
                    print("Authenticated! Starting stream...")
                else:
                    # Authentication failed
                    print(f"Authentication failed: {auth_response.get('message', 'Unknown error')}")
                    # close the websocket
                    await websocket.close()
                    return

                # Initialize frame count and start time
                frame_count = 0
                start_time = time.time()

                # loops to stream frames continuously
                while True:
                    # try and expects to receive ping and send pong back and handle errors
                    try:
                        message = await asyncio.wait_for(websocket.recv(), timeout=0.001)
                        msg_data = json.loads(message)
                        if msg_data.get("type") == "ping":
                            await websocket.send(json.dumps({"type": "pong"}))
                    # handle timeout errors
                    except asyncio.TimeoutError:
                        # No message received, continue
                        pass
                    # handle other errors
                    except:
                        # Ignore other errors, continue
                        pass
                    
                    # Frame timing start
                    frame_start = time.time()
                    
                    # Capture frame
                    frame = picam.capture_array()
                    
                    # Encode frame as JPEG
                    _, buffer = cv2.imencode(
                        '.jpg', 
                        frame, 
                        [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY]
                    )

                    # Convert frame to base64
                    frame_base64 = base64.b64encode(buffer).decode('utf-8')

                    # Create frame message
                    frame_message = {
                        "type": "frame",
                        "data": frame_base64,
                        "timestamp": time.time(),
                        "frame_number": frame_count
                    }

                    # Send frame message to websocket
                    await websocket.send(json.dumps(frame_message))

                    # Increment frame count
                    frame_count += 1
                    
                    # Print stats every 100 frames for testing
                    if frame_count % 100 == 0:
                        elapsed = time.time() - start_time
                        actual_fps = frame_count / elapsed
                        print(f"Sent {frame_count} frames | FPS: {actual_fps:.1f}")

                    # Maintain target FPS to prevent overloading the network 
                    frame_elapsed = time.time() - frame_start
                    if frame_elapsed < frame_interval:
                        await asyncio.sleep(frame_interval - frame_elapsed)

        # Handle connection closed error
        except websockets.exceptions.ConnectionClosed as error:
            print(f"Connection closed: {error}")
            print("Reconnecting in 5 seconds...")
            await asyncio.sleep(5)

        # Handle WebSocket closed error
        except websockets.exceptions.WebSocketException as error:
            print(f"WebSocket error: {error}")
            print("Reconnecting in 5 seconds...")
            await asyncio.sleep(5)
            continue

        # Handle unexpected errors
        except Exception as error:
            print(f"Unexpected error: {error}")
            print("Reconnecting in 10 seconds...")
            await asyncio.sleep(10)

async def main():
    """
    main function to start the WebSocket camera stream and capture task
    """
    print("Starting WebSocket camera stream...")
    print(f"Target resolution: {FRAME_WIDTH}x{FRAME_HEIGHT}")
    print(f"Target FPS: {FPS}")
    print(f"JPEG Quality: {JPEG_QUALITY}")
    print(f"Capture interval: {CAPTURE_INTERVAL} seconds")

    # Check camera ID first
    if not os.path.exists(ID_FILE):
        camera_id = "12345"
        print(f"Warning: ID file not found, using default ID: {camera_id}")
    else:
        with open(ID_FILE, "r") as f:
            camera_id = f.read().strip()
    
    # Initialize camera here so both tasks can use it
    picam = Picamera2()
    # Configure camera settings
    config = picam.create_video_configuration(
        main={"size": (FRAME_WIDTH, FRAME_HEIGHT)},
        controls={"NoiseReductionMode": 2}
    )
    picam.configure(config)

    # camera controls
    controls = {
        "Brightness": 0.03,
        "Sharpness": 1.2,
    }
    # set camera controls
    picam.set_controls(controls)
    # Start the camera
    picam.start()
    # Camera warm up
    time.sleep(2)

    # try to create both tasks and run them both at the same time
    try:
        # Create both tasks
        capture_task_coroutine = capture_task(picam, camera_id)
        stream_task_coroutine = stream_to_server_with_camera(picam, camera_id)

        # Run both tasks at the same time
        await asyncio.gather(
            capture_task_coroutine,
            stream_task_coroutine
        )
    # except to handle user interruptions
    except KeyboardInterrupt:
        print("\nStopped by user")
    # Handle other exceptions
    except Exception as error:
        print(f"Fatal error: {error}")
    # finally to stop the camera
    finally:
        picam.stop()

# Start the WebSocket server via asyncio
if __name__ == "__main__":
    asyncio.run(main())