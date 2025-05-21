from ultralytics import YOLO
from datetime import datetime

# Load the trained model from the "best.pt" weights file
model = YOLO("best.pt")
# Prompt the user to input the path to the image they want to analyze
image = input("Enter the image path: ")

# Run object detection on the specified image
# conf=0.2 sets minimum confidence threshold at 20%
# save=True means save the output images to disk
results = model.predict(source=image, conf=0.2, save=True)

# Process each result (typically there's just one for a single image)
for result in results:
    # Filter the detection boxes to only include "Boiler-Chicken" class
    boxes = [box for box in result.boxes if model.names[int(box.cls)] == "Boiler-Chicken"]
    # Count how many chickens were detected
    count = len(boxes)
    # Calculate average confidence (0 if no chickens found)
    avg_conf = sum(box.conf[0].item() for box in boxes) / count if count > 0 else 0
    # Get current timestamp in ISO format for logging
    timestamp = datetime.now().isoformat()

    # Print detection results as a dictionary
    print({
        "count": count,
        "confidence_percent": round(avg_conf * 100, 1),
        "timestamp": timestamp
    })