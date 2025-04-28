from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import os
import shutil

# Settings
UPLOAD_DIR = "./uploaded_images"

# Make sure the upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Create FastAPI app
app = FastAPI()

# Upload endpoint
@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    # Basic check - only allow image types
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File is not an image.")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"filename": file.filename, "path": file_path}

# Download/view endpoint
@app.get("/images/{filename}")
async def get_image(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found.")

    return FileResponse(file_path)
