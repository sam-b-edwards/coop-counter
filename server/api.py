from fastapi import FastAPI
from ultralytics import YOLO
from datetime import datetime
import os

app = FastAPI()

from fastapi.staticfiles import StaticFiles
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

        # Save the predicted image path
        pred_image_path = os.path.join("output", os.path.basename(result.save_path[0]))
        public_url = f"/output/{os.path.basename(pred_image_path)}"
        # Ensure the path is accessible
        if not os.path.exists(pred_image_path):
            return {"error": "Predicted image not found"}
        # Return the public URL
        pred_image_path = public_url

        return {
            "count": count,
            "confidence_percent": round(avg_conf * 100, 1),
            "timestamp": timestamp,
            "predicted_image": pred_image_path
        }

    return {"error": "No prediction result"}

