from fastapi import FastAPI
from ultralytics import YOLO
from datetime import datetime
import os

app = FastAPI()

# Load the model once when the server starts
model = YOLO("best.pt")

@app.get("/predict")
def predict_image():
    image_path = "images/IMG_5134.jpg"  # or any other fixed file

    # Run detection
    results = model.predict(source=image_path, conf=0.2, save=True)

    for result in results:
        boxes = [box for box in result.boxes if model.names[int(box.cls)] == "Boiler-Chicken"]
        count = len(boxes)
        avg_conf = sum(box.conf[0].item() for box in boxes) / count if count > 0 else 0
        timestamp = datetime.now().isoformat()

        return {
            "count": count,
            "confidence_percent": round(avg_conf * 100, 1),
            "timestamp": timestamp
        }

    return {"error": "No prediction result"}
