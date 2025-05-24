from fastapi import FastAPI, Response
from starlette.responses import StreamingResponse
from picamera2 import Picamera2
import cv2
import asyncio

app = FastAPI()

picam = Picamera2()
picam.configure(picam.create_video_configuration(main={"size": (640, 480)}))
picam.start()

async def generate_frames():
    while True:
        frame = picam.capture_array()
        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        await asyncio.sleep(0.05)  # 20 fps (adjust if needed)

@app.get("/stream")
async def stream():
    return StreamingResponse(generate_frames(),
                             media_type="multipart/x-mixed-replace; boundary=frame")

if __name__ == "__main__":
    import uvicorn
    print("🐔 Live stream running at http://127.0.0.1:8000/stream")
    uvicorn.run(app, host="0.0.0.0", port=8000)
