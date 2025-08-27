# CoopCounter API Endpoints

All endpoints require the API key in headers: `X-API-Key: FB438FAD-201E-47D4-8491-8A9B3F440495`

## Authentication Endpoints

- **POST** `/auth/register`
  - Register new user
  - Body: `email`, `password`, `name`, `totalChickens` (optional)
  - Returns: `userId`, `cameraId` (auto-generated 5-digit)

- **POST** `/auth/login`
  - Login user
  - Body: `email`, `password`
  - Returns: user data (without password)

## User Endpoints

- **GET** `/user/info?userId={id}`
  - Get user information
  - Query param: `userId`
  - Returns: user data

## Image Endpoints

- **POST** `/upload`
  - Upload chicken coop image
  - Form data: `camera_id`, `file` (multipart)
  - Returns: upload confirmation with image URL

- **GET** `/user/images?userId={id}`
  - Get all images for a user
  - Query param: `userId`
  - Returns: array of images with URLs

- **GET** `/user/images/latest?userId={id}`
  - Get most recent AI-processed image
  - Query param: `userId`
  - Returns: latest image with original and predicted URLs

- **GET** `/user/images/averages/hourly?userId={id}&date={date}`
  - Get hourly chicken count averages
  - Query params: `userId`, `date` (optional, format: YYYY-MM-DD)
  - Returns: array of hourly averages with time slots
  - Default: last 24 hours if no date provided

- **GET** `/user/images/averages/weekly?userId={id}&date={date}`
  - Get weekly chicken count averages
  - Query params: `userId`, `date` (optional, format: YYYY-MM-DD)  
  - Returns: array of daily averages for the week with day names
  - Default: current week if no date provided

## Static Files

- **GET** `/uploads/{filename}`
  - Serve original uploaded images
  
- **GET** `/output/{filename}`
  - Serve AI-processed prediction images