import bcrypt

# Password hashing function using bcrypt
def hash_password(password: str) -> str:
    
    # Generate salt with 12 rounds by default
    salt = bcrypt.gensalt()
    
    # Convert password to bytes and then hashes it with the salt
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    # Convert bytes back to string for database storage
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Convert both to bytes and let bcrypt solve the password
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))