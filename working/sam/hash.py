import bcrypt

password = input("Enter Password:")

# Password hashing function using bcrypt
def hash_password(password: str) -> str:
    
    # Generate salt with 12 rounds by default
    salt = bcrypt.gensalt()
    
    # Convert password to bytes and then hashes it with the salt
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    
    # Convert bytes back to string for database storage
    return hashed.decode('utf-8')

hashed_password = hash_password(password)
print(hashed_password)