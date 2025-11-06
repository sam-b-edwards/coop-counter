/**
 * App Configuration
 *
 * This file centralizes all configuration values.
 * Values are loaded from environment variables with fallbacks for demo mode.
 */

// API Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://coopcounter.comdevelopment.com';
export const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://coopcounter.comdevelopment.com';

// Demo Mode Configuration
// Set DEMO_MODE=true to run the app without a backend (uses mock data)
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

// Demo Account Credentials
// Users can login with these credentials to see the UI without backend setup
export const DEMO_ACCOUNT = {
  email: 'demo@coopcounter.app',
  password: 'demo123',
  userId: 999,  // Numeric user ID for demo
  name: 'Demo User',
  totalChickens: 50,
};

// Camera Configuration
// Set EXPO_PUBLIC_CAMERA_ID in .env to your camera's ID for live streaming
export const CAMERA_ID = process.env.EXPO_PUBLIC_CAMERA_ID || 'your-camera-id';

/**
 * Get API endpoint URL
 */
export const getApiUrl = (endpoint: string): string => {
  if (DEMO_MODE) {
    console.log('[DEMO MODE] API call to:', endpoint);
    return `${API_URL}${endpoint}`;
  }
  return `${API_URL}${endpoint}`;
};

/**
 * Get WebSocket URL
 */
export const getWebSocketUrl = (cameraId: string, userId: string): string => {
  return `${WS_URL}/ws/stream/watch/${cameraId}?user_id=${userId}`;
};

// Mock Data for Demo Mode
export const MOCK_DATA = {
  latestImage: {
    ai_predicted_at: new Date().toISOString(),
    certainty: 87,
    chickenCount: 42,
    original_url: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800',
    uploaded_at: new Date().toISOString(),
  },
  userData: {
    email: DEMO_ACCOUNT.email,
    name: DEMO_ACCOUNT.name,
    totalChickens: DEMO_ACCOUNT.totalChickens,
  },
};

// Export config object for easy access
export default {
  API_URL,
  WS_URL,
  DEMO_MODE,
  DEMO_ACCOUNT,
  CAMERA_ID,
  MOCK_DATA,
  getApiUrl,
  getWebSocketUrl,
};
