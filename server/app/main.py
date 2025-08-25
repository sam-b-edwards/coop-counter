from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
from app.config import settings
from app.routers import users, images, upload

# Create FastAPI app instance
app = FastAPI()

# Add CORS middleware to allow requests from React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories for uploads and AI predictions if they don't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.OUTPUT_DIR, exist_ok=True)

# Mount static file directories to serve images
app.mount("/output", StaticFiles(directory=settings.OUTPUT_DIR), name="output")
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers for different endpoints
app.include_router(upload.router, tags=["upload"])
app.include_router(users.router, prefix="/user", tags=["users"])
app.include_router(images.router, prefix="/user/images", tags=["images"])