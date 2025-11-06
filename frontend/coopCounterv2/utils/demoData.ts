/**
 * Demo Data Utilities
 *
 * Provides mock data for demo account (user ID 999)
 * This allows users to explore the UI without setting up backend
 */

import { DEMO_ACCOUNT } from '../config';

// Mock chicken image URL (placeholder)
const MOCK_CHICKEN_IMAGE = 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&q=80';

/**
 * Check if the current user is the demo user
 */
export const isDemoUser = (userId: string | number): boolean => {
  return String(userId) === String(DEMO_ACCOUNT.userId);
};

/**
 * Get mock data for latest image scan
 */
export const getMockLatestImage = () => {
  const now = new Date();
  return {
    ai_predicted_at: now.toISOString(),
    certainty: 87,
    chickenCount: 42,
    original_url: MOCK_CHICKEN_IMAGE,
    uploaded_at: now.toISOString(),
  };
};

/**
 * Get mock user info
 */
export const getMockUserInfo = () => {
  return {
    email: DEMO_ACCOUNT.email,
    name: DEMO_ACCOUNT.name,
    totalChickens: DEMO_ACCOUNT.totalChickens,
  };
};

/**
 * Get mock hourly averages data
 */
export const getMockHourlyAverages = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return hours.map(hour => ({
    hour,
    avgChickens: Math.floor(Math.random() * 10) + 35, // Random between 35-45
    timestamp: new Date().setHours(hour, 0, 0, 0),
  }));
};

/**
 * Get mock weekly averages data
 */
export const getMockWeeklyAverages = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, index) => ({
    day,
    avgChickens: Math.floor(Math.random() * 8) + 38, // Random between 38-46
    dayIndex: index,
  }));
};

/**
 * Intercept fetch calls for demo user and return mock data
 *
 * Usage:
 * const response = await fetchWithDemo(url, userId, options);
 */
export const fetchWithDemo = async (
  url: string,
  userId: string | number,
  options?: RequestInit
): Promise<Response> => {
  // If not demo user, proceed with real fetch
  if (!isDemoUser(userId)) {
    return fetch(url, options);
  }

  // Demo user - return mock data based on endpoint
  console.log('[DEMO MODE] Intercepting fetch:', url);

  let mockData: any;

  if (url.includes('/user/images/latest')) {
    mockData = getMockLatestImage();
  } else if (url.includes('/user/info')) {
    mockData = getMockUserInfo();
  } else if (url.includes('/user/images/averages/hourly')) {
    mockData = getMockHourlyAverages();
  } else if (url.includes('/user/images/averages/weekly')) {
    mockData = getMockWeeklyAverages();
  } else {
    // Unknown endpoint - return empty object
    mockData = {};
  }

  // Return a mock Response object
  return new Response(JSON.stringify(mockData), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
