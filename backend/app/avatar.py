import requests
import os
from app.database import get_db

def generate_avatar(name, user_id):
    """
    Generate avatar using ui-avatars.com and save to database
    """
    
    # Import settings
    from app.config import settings
    
    # Ensure avatar directory exists
    avatar_dir = settings.AVATAR_DIR
    # Create directory if it doesn't exist
    os.makedirs(avatar_dir, exist_ok=True)
    
    # Parameters for avatar generation
    params = {
        'name': name,
        'background': 'random',  
        'color': 'ffffff',
        'size': '200',
        'format': 'png',
        'bold': 'true',
        'uppercase': 'true'
    }
    
    # URL for avatar generation
    url = "https://ui-avatars.com/api/"

    # Generate avatar
    # Use try-except to handle potential errors
    try:
        # Make request to ui-avatars.com
        response = requests.get(url, params=params, timeout=10)
        # Check if request was successful
        response.raise_for_status()
        
        # Create filename using name and user_id
        # removes spaces and makes lowercase
        filename = f"{name.lower().replace(' ', '_')}_{user_id}.png"
        # Save avatar to filesystem
        filepath = os.path.join(avatar_dir, filename)
        
        # Write image to file
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        # Save filename to database
        db = get_db()
        cursor = db.cursor()
        
        # Update user's icon in database
        cursor.execute(
            "UPDATE users SET icon = %s WHERE id = %s",
            (filename, user_id)
        )
        # Commit changes
        db.commit()
        
        # Close cursor and connection
        cursor.close()
        db.close()
        
        # Return the filename
        return filename
    
    # Handle request errors
    except requests.RequestException as error:
        print(f"Error generating avatar: {error}")
        return None

def get_avatar(user_id):
    """
    Gets avatar filename from database for a given user_id
    """
    # Connect to database
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    # Query to get avatar filename for user_id
    cursor.execute("SELECT icon FROM users WHERE id = %s", (user_id,))
    # Fetch one result
    result = cursor.fetchone()
    
    # Close cursor and connection
    cursor.close()
    db.close()
        
    # Return the icon filename or None if not found
    if result:
        return result['icon']
    else:
        return None

