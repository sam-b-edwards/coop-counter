from fastapi import FastAPI
from ultralytics import YOLO
from datetime import datetime
import os
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve the directory that YOLO saves prediction images into
app.mount("/output", StaticFiles(directory="runs/detect/predict"), name="output")

# Load the model once when the server starts
model = YOLO("best.pt")

@app.get("/predict")
def predict_image():
    image_path = "images/IMG_5134.jpg"

    # Run detection
    results = model.predict(source=image_path, conf=0.2, save=True)

    for result in results:
        boxes = [box for box in result.boxes if model.names[int(box.cls)] == "Boiler-Chicken"]
        count = len(boxes)
        avg_conf = sum(box.conf[0].item() for box in boxes) / count if count > 0 else 0
        timestamp = datetime.now().isoformat()

        # Get the predicted image filename and public URL
        pred_filename = os.path.basename(image_path)
        public_url = f"/output/{pred_filename}"

        return {
            "count": count,
            "confidence_percent": round(avg_conf * 100, 1),
            "timestamp": timestamp,
            "predicted_image": public_url
        }

    return {"error": "No prediction result"}
