# Coop Counter 🐔

An AI-powered monitoring system that automatically detects and counts chickens inside a backyard coop using a YOLO object detection model. Built with a Raspberry Pi camera module that captures images every five minutes and streams live video via WebSocket to a FastAPI backend server for real-time flock monitoring.

This was developed as a school project in collaboration with [@kaelangraham](https://github.com/kaelangraham), who developed the React Native mobile application.

## Features

- **AI-Powered Counting**: Uses YOLO object detection to accurately count chickens
- **Live Camera Streaming**: Real-time WebSocket video feed from your coop
- **Automated Scans**: Schedule automatic chicken counting throughout the day
- **Mobile App**: React Native (Expo) app for iOS and Android
- **Demo Mode**: Try the UI without backend setup using demo credentials
- **Door Control**: Remote coop door control interface (hardware integration required)

## Project Structure

```
counting-chickens/
├── frontend/           # Mobile app (React Native + Expo)
│   └── coopCounterv2/
├── backend/            # API server (FastAPI + Python)
│   ├── app/
│   ├── best.pt        # YOLO model weights
│   └── predict.py     # Batch prediction script
├── database/          # Database schema
│   └── schema.sql     # MySQL/MariaDB table structure
└── camera/            # Camera streaming service (optional)
```

## Quick Start - Demo Mode

Want to see the app in action without setting up the backend? Use our demo account:

1. Clone the repository:
```bash
git clone https://github.com/yourusername/counting-chickens.git
cd counting-chickens/frontend/coopCounterv2
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Start the app:
```bash
npx expo start
```

4. Login with demo credentials:
- **Email**: `demo@coopcounter.app`
- **Password**: `demo123`

The demo mode shows mock data so you can explore all the UI features!

## System Components

The Coop Counter system consists of four main components:

### 1. Camera (Raspberry Pi)
- Captures images every 5 minutes
- Streams live video via WebSocket
- Runs 24/7 with PoE power

### 2. Backend Server (FastAPI)
- Processes images with YOLO model
- Handles WebSocket connections
- Manages API endpoints
- Runs prediction scripts

### 3. Database (MySQL/MariaDB)
- Stores user accounts
- Saves chicken count history
- Tracks predictions and timestamps

### 4. Frontend (React Native)
- Mobile app for iOS/Android
- Real-time monitoring dashboard
- Live camera streaming view
- Demo mode for testing

## Setup Instructions

### Prerequisites

- **For Backend**: Python 3.9+, pip
- **For Frontend**: Node.js 18+, npm, Expo CLI
- **For Database**: MySQL 8.0+ or MariaDB 10.6+
- **For Camera**: Raspberry Pi, Camera Module, PoE HAT (optional)

### 1. Database Setup

1. **Install MySQL/MariaDB** on your server or local machine

2. **Create the database:**
```bash
mysql -u root -p
```
```sql
CREATE DATABASE coopcounter;
USE coopcounter;
```

3. **Import the schema:**
```bash
mysql -u your_username -p coopcounter < database/schema.sql
```

4. **Verify tables were created:**
```sql
SHOW TABLES;
```

### 2. Backend Server Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create Python virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database credentials and settings
```

5. **Start the API server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### 3. Frontend Mobile App Setup

1. **Navigate to frontend directory:**
```bash
cd frontend/coopCounterv2
```

2. **Install dependencies:**
```bash
npm install --legacy-peer-deps
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your API URL and camera ID
```

4. **Start Expo development server:**
```bash
npx expo start
```

5. **Run on device:**
   - **iOS**: Scan QR code with Camera app
   - **Android**: Scan QR code in Expo Go app

### 4. Camera Setup (Raspberry Pi)

1. **Hardware setup:**
   - Connect Pi Camera Module to CSI port
   - Install PoE HAT (recommended) or use standard power
   - Connect Ethernet cable

2. **Software setup on Raspberry Pi:**
```bash
cd camera
pip install -r requirements.txt
```

3. **Configure camera ID in environment**

4. **Run streaming script:**
```bash
python stream_websocket.py
```

The camera will start streaming to your backend server

## API Endpoints

### Main Endpoints
- `GET /user/images/latest` - Get the latest chicken count
- `GET /user/info` - Get user information
- `POST /auth/login` - User authentication
- `WS /ws/stream/watch/{camera_id}` - WebSocket camera streaming

### Batch Processing
The `predict.py` script can be run separately to process images in batch:
```bash
cd backend
python predict.py
```

## Architecture Notes

### Single Camera, Multiple Users
The current implementation uses a single shared camera for all users. While the database schema supports individual camera IDs per user (for future expansion), the current version streams from one camera configured via `EXPO_PUBLIC_CAMERA_ID` in the environment variables. All users view the same camera feed.

### Why Power over Ethernet?
The Raspberry Pi camera uses PoE for reliability:
- Single cable provides both network and power
- Runs continuously without recharging
- No WiFi connection drops
- Simpler installation and maintenance

## Technologies Used

### Frontend
- **React Native** with **Expo SDK 53**
- **NativeWind v4** (Tailwind CSS for React Native)
- **TypeScript**
- **Expo Router** for navigation
- **Phosphor Icons** for UI icons

### Backend
- **FastAPI** for the REST API
- **Ultralytics YOLO** for chicken detection
- **OpenCV** for image processing
- **MySQL** for data storage
- **WebSockets** for live streaming

## Model Information

The app uses a YOLOv8 model trained specifically for chicken detection. The model weights (`best.pt`) are included in the repository and detect "Boiler-Chicken" class with a default confidence threshold of 0.2.

## Contributing

This was developed as a school project. The frontend was worked on by my friend [@kaelangraham](https://github.com/kaelangraham).

## Troubleshooting

### Expo SDK Version Mismatch
If you see an error about Expo SDK versions, make sure you have Expo Go SDK 53 installed:
- iOS: Install from [Expo Go SDK 53 for iOS](https://expo.dev/go?sdkVersion=53&platform=ios)
- Android: Install from [Expo Go SDK 53 for Android](https://expo.dev/go?sdkVersion=53&platform=android)

### iOS Auto-Capitalization Issue
The app disables auto-capitalization on login inputs. If you have issues logging in on iOS, ensure you're entering the email in lowercase.

### Package Installation Issues
If you encounter peer dependency conflicts, always use:
```bash
npm install --legacy-peer-deps
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Frontend mobile app developed by [@kaelangraham](https://github.com/kaelangraham)
- YOLO model for accurate chicken detection
- Built with love for our feathered friends 🐔