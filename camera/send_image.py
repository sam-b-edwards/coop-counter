from picamera2 import Picamera2
import requests
import time

FILENAME = "/tmp/capture.jpg"
SERVER_URL = "http://coopcounter.comdevelopment.com/upload"

# Capture image
piecam = Picamera2()
picam.configure(picam.create_still_configuration())
picam.start()
time.sleep(2)
picam.capture_file(FILENAME)

# Send image to server
with open(FILENAME, "rb") as f:
    response = requests.post(SERVER_URL, files={"file": f})

print("Server response:", response.json())
