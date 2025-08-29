import requests
import os
from app.database import get_db

def generate_avatar(name, user_id):
    """
    Generate avatar using UI Avatars API, save to server and database
    Returns the filename if successful, None otherwise
    """
    from app.config import settings
    
    avatar_dir = settings.AVATAR_DIR
    os.makedirs(avatar_dir, exist_ok=True)
    
    params = {
        'name': name,
        'background': 'random',  
        'color': 'ffffff',
        'size': '200',
        'format': 'png',
        'bold': 'true',
        'uppercase': 'true'
    }
    
    url = "https://ui-avatars.com/api/"
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        # Create filename using name and user_id
        filename = f"{name.lower().replace(' ', '_')}_{user_id}.png"
        filepath = os.path.join(avatar_dir, filename)
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        # Save to database
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute(
            "UPDATE users SET icon = %s WHERE id = %s",
            (filename, user_id)
        )
        db.commit()
        
        cursor.close()
        db.close()
        
        return filename
    
    except requests.RequestException as e:
        print(f"Error generating avatar: {e}")
        return None

def get_avatar(user_id):
    """
    Get user's avatar from database
    Returns the filename if exists
    """
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    cursor.execute("SELECT icon FROM users WHERE id = %s", (user_id,))
    result = cursor.fetchone()
    
    cursor.close()
    db.close()
        
    if result:
        return result['icon']
    else:
        return None

