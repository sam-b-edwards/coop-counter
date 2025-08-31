import asyncio
import websockets
import cv2
import base64
import json
import os
import time
from picamera2 import Picamera2

# Configuration constants
ID_FILE = '/home/sam/ID.txt'
# WebSocket server URL
SERVER_URL = "ws://coopcounter.comdevelopment.com/ws/stream/push"
# Video stream configuration
FRAME_WIDTH = 1280
FRAME_HEIGHT = 720
FPS = 15
JPEG_QUALITY = 85

async def stream_to_server():
    """
    Connect to the WebSocket server and stream video frames
    """

    # Check if ID file exists
    if not os.path.exists(ID_FILE):
        # For testing, uses a testing camera ID
        camera_id = "12345"
        print(f"Warning: ID file not found, using default ID: {camera_id}")
    else:
        # Read camera ID from file
        with open(ID_FILE, "r") as f:
            camera_id = f.read().strip()

    # Print camera ID and server URL
    print(f"Camera ID: {camera_id}")
    print(f"Connecting to server: {SERVER_URL}")
    
    # Initialize camera
    picam = Picamera2()
    # Set camera configuration
    config = picam.create_video_configuration(
        main={"size": (FRAME_WIDTH, FRAME_HEIGHT)}
    )
    # Apply configuration to camera
    picam.configure(config)
    
    # Set camera controls optimized for NoIR sensor
    controls = {
        "Saturation": 1.0,
        "Contrast": 1.1,
        "Brightness": 0.1,
        "Sharpness": 1.2,
        "AwbMode": 1,
        "ExposureValue": 0.0,
        "AeEnable": True,
        "AwbEnable": True,
    }
    # Apply controls to camera
    picam.set_controls(controls)
    
    # Start camera
    picam.start()
    # Allow camera to warm up
    time.sleep(2)

    # Frame timing
    frame_interval = 1.0 / FPS

    # loops to maintain connection to websocket
    while True:
        # Attempt to connect to websocket
        try:
            print(f"Attempting to connect to {SERVER_URL}...")

            # Connect to websocket
            async with websockets.connect(
                SERVER_URL,
                ping_interval=10,
                ping_timeout=5
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

    # Cleanup and close the camera stream
    picam.stop()

async def main():
    """
    main function to start the WebSocket camera stream and send frames to the server via WebSocket
    """
    print("Starting WebSocket camera stream...")
    print(f"Target resolution: {FRAME_WIDTH}x{FRAME_HEIGHT}")
    print(f"Target FPS: {FPS}")
    print(f"JPEG Quality: {JPEG_QUALITY}")

    # try and expects to connect to the WebSocket server and start streaming and sending frames and handle errors
    try:
        # Start the WebSocket stream
        await stream_to_server()
    # Handle keyboard interrupt errors
    except KeyboardInterrupt:
        print("\nStream stopped by user")
    # Handle WebSocket closed errors
    except websockets.exceptions.ConnectionClosed as error:
        print(f"WebSocket connection closed: {error}")
    # Handle other exceptions
    except Exception as error:
        print(f"Fatal error: {error}")

# Start the WebSocket server via asyncio
if __name__ == "__main__":
    asyncio.run(main())