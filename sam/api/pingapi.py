from fastapi import FastAPI, Header, HTTPException
from fastapi.responses import JSONResponse


app = FastAPI()

API_KEY = "myapikey"  # Replace with your actual API key

# check if api is running
@app.get("/")
async def root():
    return JSONResponse(content={"message": "Welcome to the FastAPI server!"}, status_code=200)

# Ping endpoint
# This endpoint checks if the API is running and validates the API key
# It returns a simple JSON response with a "Pong!" message.
@app.get("/ping")
async def ping(x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key.")
    return JSONResponse(content={"message": "Pong!"}, status_code=200)
