from fastapi import FastAPI
from ultralytics import YOLO
from datetime import datetime
import os

app = FastAPI()

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

        # Get the saved image path (should be one per result)
        pred_image_path = result.save_dir + "/" + os.path.basename(image_path)

        return {
            "count": count,
            "confidence_percent": round(avg_conf * 100, 1),
            "timestamp": timestamp,
            "predicted_image": pred_image_path
        }

    return {"error": "No prediction result"}

