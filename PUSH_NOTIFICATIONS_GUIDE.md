# Push Notifications Setup Guide

## How Push Notifications Work
```
Your Backend → Expo Push Service → Apple/Google → User's Phone
```

## 1. Database Setup
Add push token column to users table:
```sql
ALTER TABLE users ADD COLUMN push_token VARCHAR(255);
```

## 2. Frontend (React Native/Expo)
Get push token when user enables notifications:
```javascript
import * as Notifications from 'expo-notifications';

// Get permission and token
const { status } = await Notifications.requestPermissionsAsync();
if (status === 'granted') {
  const token = await Notifications.getExpoPushTokenAsync();
  // Token looks like: "ExponentPushToken[xxxxxxxxxxxxxx]"
  
  // Save to backend
  await fetch('http://coopcounter.com/user/save-push-token', {
    method: 'POST',
    headers: {
      'X-API-Key': 'your-api-key',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userId: userId,
      pushToken: token.data
    })
  });
}
```

## 3. Backend Endpoint to Save Token
```python
@router.post("/save-push-token")
async def save_push_token(userId: int, pushToken: str):
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "UPDATE users SET push_token = %s WHERE id = %s",
        (pushToken, userId)
    )
    db.commit()
    return {"message": "Push token saved"}
```

## 4. Backend Function to Send Notifications
```python
import requests

def send_push_notification(push_token, title, message, data=None):
    """Send push notification via Expo"""
    
    notification = {
        'to': push_token,
        'title': title,
        'body': message,
        'sound': 'default',
        'badge': 1
    }
    
    if data:
        notification['data'] = data
    
    response = requests.post(
        'https://exp.host/--/api/v2/push/send',
        json=notification,
        headers={
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    )
    
    return response.json()
```

## 5. Example: Send Low Chicken Alert
```python
@router.post("/check-and-alert")
async def check_chicken_count(userId: int):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # Get user's latest chicken count and push token
    cursor.execute("""
        SELECT u.push_token, i.chickenCount 
        FROM users u 
        JOIN images i ON u.id = i.userId 
        WHERE u.id = %s 
        ORDER BY i.uploaded_at DESC 
        LIMIT 1
    """, (userId,))
    
    result = cursor.fetchone()
    
    if result and result['push_token'] and result['chickenCount'] < 5:
        # Send notification
        send_push_notification(
            result['push_token'],
            "⚠️ Low Chicken Alert!",
            f"Only {result['chickenCount']} chickens detected in coop",
            {"screen": "ChickenStatus", "count": result['chickenCount']}
        )
    
    return {"checked": True}
```

## 6. Automated Checking (Cron Job)
Add to your server's crontab to check every hour:
```bash
# Check all users every hour
0 * * * * curl -X POST http://localhost:8000/check-all-users-chickens
```

## 7. Testing Push Notifications
Use Expo's push notification tool:
https://expo.dev/notifications

Just paste in your ExponentPushToken and test!

## Important Notes
- Expo Push Service is FREE
- Works with both iOS and Android
- User must grant notification permissions
- Tokens can expire - handle token updates
- Test notifications work even in development

## Error Handling
Always check if push token exists before sending:
```python
if user['push_token']:
    send_push_notification(...)
else:
    # User hasn't enabled notifications
    pass
```