#!/usr/bin/env python3
import os
from datetime import datetime
from ultralytics import YOLO
import mysql.connector

# Constants for directories
BASE_DIR = "/home/sam/counting-chickens/server"
UPLOAD_DIR = f"{BASE_DIR}/uploads"
OUTPUT_DIR = f"{BASE_DIR}/runs/detect/predict"
MODEL_PATH = f"{BASE_DIR}/best.pt"

# Load model
model = YOLO(MODEL_PATH)

# Connect to DB
db = mysql.connector.connect(
    host="localhost",
    user="admin",
    password="S5XF3koM93",
    database="coopcounter"
)

# Create a cursor to interact with the database
cursor = db.cursor(dictionary=True)

# Gets all unprocessed images
cursor.execute("SELECT * FROM images WHERE chickenCount IS NULL AND certainty IS NULL")
rows = cursor.fetchall()

# see if there are any unprocessed images
if not rows:
    print("No unprocessed images found.")
else:
    print(f"Found {len(rows)} unprocessed images.")

# gets the imageId and image filename from the rows
for row in rows:
    image_id = row["imageId"]
    image_filename = row["image"]
    image_path = os.path.join(UPLOAD_DIR, image_filename)

    # Check if the image file exists
    if not os.path.exists(image_path):
        print(f"Image not found: {image_path}")
        continue

    # predicts the image using the YOLO model
    print(f"Predicting image: {image_filename}")
    results = model.predict(
        source=image_path,
        conf=0.1,
        save=True,
        project=f"{BASE_DIR}/runs/detect",
        name="predict",
        exist_ok=True
    )

    # variables to store the chicken count and average confidence for the image
    count = 0
    avg_conf = 0.0

    # Loop through the results and counts the number of "Boiler-Chicken" detections
    # calculates the average confidence
    # if there are no detections, the count will be 0 and avg_conf will be 0
    for result in results:
        boxes = [box for box in result.boxes if model.names[int(box.cls)] == "chicken"]
        count = len(boxes)
        if count > 0:
            avg_conf = sum(box.conf[0].item() for box in boxes) / count
    
    # gets the current time
    now = datetime.now()

    # execute the update query to update the chicken count and certainty in the database
    cursor.execute("UPDATE images SET chickenCount = %s, certainty = %s, ai_predicted_at = %s WHERE imageId = %s", (count, round(avg_conf * 100), now, image_id))
    db.commit()
    print(f"Updated image {image_id} with chicken count: {count} and certainty: {round(avg_conf * 100)}%")


# Close the cursor and database connection
cursor.close()
db.close()