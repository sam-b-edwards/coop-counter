# Coop Counter 🐔

An AI-powered chicken counting application that uses computer vision to automatically count chickens in your coop. Monitor your flock with real-time camera streaming and automated daily scans.

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

## Full Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- MySQL 8.0+ (database setup coming soon)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone for testing

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file from the example:
```bash
cp .env.example .env
```

5. Edit `.env` with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=coopcounter

# API Configuration
BASE_URL=http://localhost:8000

# Model Configuration
MODEL_PATH=./best.pt
CONFIDENCE_THRESHOLD=0.2
DETECTION_CLASS=Boiler-Chicken
```

6. Start the API server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend/coopCounterv2
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```
*Note: We use `--legacy-peer-deps` due to specific package version requirements*

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Edit `.env` with your configuration:
```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_WS_URL=ws://localhost:8000

# Camera Configuration (if you have a camera setup)
EXPO_PUBLIC_CAMERA_ID=your-camera-id
```

5. Start the Expo development server:
```bash
npx expo start
```

6. Run on your device:
   - **iOS**: Scan the QR code with your iPhone camera
   - **Android**: Scan the QR code with the Expo Go app
   - **iOS Simulator**: Press `i` in the terminal
   - **Android Emulator**: Press `a` in the terminal

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

## Contributing

This was developed as a school project. The frontend was worked on by my friend [@kaelangraham](https://github.com/kaelangraham).

## Database Setup

### Prerequisites
- MySQL 8.0+ or MariaDB 10.6+
- A MySQL user with CREATE and INSERT privileges

### Setup Instructions

1. **Log into MySQL:**
```bash
mysql -u root -p
```

2. **Create the database:**
```sql
CREATE DATABASE coopcounter;
USE coopcounter;
```

3. **Import the schema:**
```bash
mysql -u your_username -p coopcounter < database/schema.sql
```

4. **Verify the tables were created:**
```sql
SHOW TABLES;
```
You should see:
- `users` - User accounts with camera assignments
- `images` - Uploaded images with AI predictions and chicken counts

5. **Create a test user (optional):**
```sql
INSERT INTO users (email, password, name, cameraId, totalChickens)
VALUES ('test@example.com', 'hashed_password_here', 'Test User', 'camera-001', 50);
```

**Note:** Passwords should be hashed using bcrypt before storing. The backend handles this automatically during user registration.

## License

This project is open source and free for anyone to use.

## Acknowledgments

- Frontend mobile app developed by [@kaelangraham](https://github.com/kaelangraham)
- YOLO model for accurate chicken detection
- Built with love for our feathered friends 🐔