from picamera2 import Picamera2
import requests
import time
import os
import uuid
import json

FILENAME = "/tmp/capture.jpg"
SERVER_URL = "http://coopcounter.comdevelopment.com/upload"
ID_FILE = '/home/pi/ID.txt'

if os.path.exists(ID_FILE):
    with open(ID_FILE, 'r') as f:
        camera_id = f.read().strip()
else:
    camera_id = str(uuid.uuid4())
    with open(ID_FILE, 'w') as f:
        f.write(camera_id)

print("Camera ID:", camera_id)

picam = Picamera2()
picam.configure(picam.create_still_configuration())
picam.start()
time.sleep(2)
picam.capture_file(FILENAME)
print("Image captured.")

with open(FILENAME, "rb") as f:
    response = requests.post(SERVER_URL, files={"file": f}, data={"camera_id": camera_id})
    print("Uploaded Server response:", response.json())
