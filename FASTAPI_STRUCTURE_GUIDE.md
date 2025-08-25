# FastAPI Project Structure - Industry Standards Guide

## Overview

This guide outlines the industry-standard approach for structuring FastAPI applications, moving from a single-file API to a scalable, maintainable architecture used in production environments.

## Why Modular Structure?

### Single File Approach (Not Recommended for Production)
```python
# api.py - Everything in one file
from fastapi import FastAPI

app = FastAPI()

@app.get("/users")
def get_users():
    pass

@app.get("/projects")
def get_projects():
    pass

# 500+ lines later... unmaintainable!
```

### Modular Approach (Industry Standard)
- **Separation of Concerns**: Each module handles specific functionality
- **Scalability**: Easy to add new features without affecting existing code
- **Team Collaboration**: Multiple developers can work simultaneously
- **Testing**: Easier to write unit tests for isolated components
- **Maintainability**: Code is organized and easy to navigate

## Standard Project Structure

```
project-name/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app creation & configuration
│   ├── config.py            # Settings and environment variables
│   ├── database.py          # Database connection and session management
│   ├── auth.py              # Authentication logic
│   ├── utils.py             # Shared utility functions
│   │
│   ├── routers/            # API route handlers
│   │   ├── __init__.py
│   │   ├── users.py
│   │   ├── projects.py
│   │   ├── auth.py
│   │   └── ...
│   │
│   ├── schemas/            # Pydantic models for request/response
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── project.py
│   │   └── ...
│   │
│   ├── models/             # Database models (SQLAlchemy/ORM)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── project.py
│   │   └── ...
│   │
│   ├── services/           # Business logic layer
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   ├── email_service.py
│   │   └── ...
│   │
│   ├── queries/            # Database queries (if not using ORM)
│   │   ├── __init__.py
│   │   └── queries.py
│   │
│   └── middleware/         # Custom middleware
│       ├── __init__.py
│       ├── logging.py
│       └── rate_limiting.py
│
├── tests/                  # Test files
│   ├── __init__.py
│   ├── test_users.py
│   ├── test_projects.py
│   └── ...
│
├── scripts/                # Utility scripts
│   ├── migrate.py
│   └── seed_data.py
│
├── alembic/               # Database migrations (if using Alembic)
│   └── versions/
│
├── .env                   # Environment variables (never commit!)
├── .env.example           # Example environment variables
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
├── run.py               # Application entry point
└── README.md            # Project documentation
```

## Core Components Explained

### 1. Main Application (`app/main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import users, projects, auth

# Create FastAPI instance
app = FastAPI(
    title="Your API Name",
    description="API Description",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### 2. Configuration (`app/config.py`)

```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Your API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # External Services
    AWS_ACCESS_KEY_ID: str = None
    AWS_SECRET_ACCESS_KEY: str = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

### 3. Router Example (`app/routers/users.py`)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.user import User, UserCreate, UserUpdate
from app.services.user_service import UserService
from app.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[User])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends()
):
    """Get all users with pagination"""
    return await user_service.get_users(skip=skip, limit=limit)

@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends()
):
    """Get specific user by ID"""
    user = await user_service.get_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_user),
    user_service: UserService = Depends()
):
    """Create a new user"""
    return await user_service.create_user(user_data)
```

### 4. Pydantic Schemas (`app/schemas/user.py`)

```python
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True  # For ORM compatibility
```

### 5. Service Layer (`app/services/user_service.py`)

```python
from typing import List, Optional
from app.database import get_db
from app.schemas.user import UserCreate, UserUpdate, User
import app.queries.user_queries as queries

class UserService:
    def __init__(self):
        self.db = get_db()
    
    async def get_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """Get all users with pagination"""
        with self.db() as cursor:
            return queries.get_all_users(cursor, skip, limit)
    
    async def get_user(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        with self.db() as cursor:
            return queries.get_user_by_id(cursor, user_id)
    
    async def create_user(self, user_data: UserCreate) -> User:
        """Create new user"""
        with self.db() as cursor:
            # Hash password, validate data, etc.
            return queries.create_user(cursor, user_data.dict())
```

### 6. Database Connection (`app/database.py`)

```python
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from app.config import settings

@contextmanager
def get_db():
    """Database connection context manager"""
    conn = psycopg2.connect(
        settings.DATABASE_URL,
        cursor_factory=RealDictCursor
    )
    try:
        yield conn.cursor()
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
```

### 7. Entry Point (`run.py`)

```python
import uvicorn
from app.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
```

## Best Practices

### 1. API Versioning
Always version your API from the start:
```python
app.include_router(users.router, prefix="/api/v1/users")
```

### 2. Dependency Injection
Use FastAPI's dependency injection for:
- Database sessions
- Authentication
- Service classes
- Configuration

### 3. Error Handling
Create custom exception handlers:
```python
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)}
    )
```

### 4. Documentation
- Use docstrings for all endpoints
- Define clear response models
- Provide examples in Pydantic schemas

### 5. Security
- Never commit `.env` files
- Use environment variables for secrets
- Implement proper authentication/authorization
- Validate all inputs with Pydantic
- Use HTTPS in production

### 6. Testing Structure
```
tests/
├── conftest.py          # Pytest fixtures
├── test_auth.py
├── test_users.py
├── integration/         # Integration tests
│   └── test_api.py
└── unit/               # Unit tests
    └── test_services.py
```

### 7. Logging
```python
import logging

logger = logging.getLogger(__name__)

@router.get("/users")
async def get_users():
    logger.info("Fetching users")
    try:
        # ... code
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise
```

## Environment Variables (.env.example)

```env
# Application
ENVIRONMENT=development
DEBUG=True

# Database
DATABASE_URL=postgresql://user:password@localhost/dbname

# Security
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=["http://localhost:3000"]

# External Services
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
STRIPE_SECRET_KEY=
SENDGRID_API_KEY=

# Redis (for caching/queues)
REDIS_URL=redis://localhost:6379
```

## Common Patterns

### 1. Pagination
```python
@router.get("/items")
async def get_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    return {"items": items[skip:skip+limit]}
```

### 2. Filtering
```python
@router.get("/items")
async def get_items(
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None
):
    # Apply filters
    pass
```

### 3. Background Tasks
```python
from fastapi import BackgroundTasks

@router.post("/send-email")
async def send_email(
    email: EmailSchema,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(send_email_task, email)
    return {"message": "Email will be sent"}
```

## Deployment Considerations

### Docker Configuration
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Production Checklist
- [ ] Disable debug mode
- [ ] Hide API documentation in production
- [ ] Set up proper logging
- [ ] Configure rate limiting
- [ ] Implement health checks
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Configure auto-scaling
- [ ] Set up CI/CD pipeline
- [ ] Implement proper backup strategy
- [ ] Use connection pooling for database
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up SSL/TLS certificates

## Component Differences Explained

Understanding the difference between each component is crucial for properly structuring your FastAPI application:

### 1. **Routes/Routers** (`app/routers/`)
**Purpose**: Handle HTTP requests and define API endpoints

```python
# app/routers/users.py
@router.get("/users/{user_id}")  # This is a route
async def get_user(user_id: int):
    # Handles GET request to /api/v1/users/123
    return user_data
```

- **What they do**: Define URL paths and HTTP methods (GET, POST, PUT, DELETE)
- **Responsibility**: Accept requests, validate input, call business logic, return responses
- **Think of it as**: The "web layer" - the entry points to your API

### 2. **Schemas** (`app/schemas/`)
**Purpose**: Define data structure and validation rules

```python
# app/schemas/user.py
class UserCreate(BaseModel):
    email: EmailStr  # Must be valid email
    age: int         # Must be integer
    name: str        # Must be string
```

- **What they do**: Validate incoming/outgoing data
- **Responsibility**: Ensure data types, formats, required fields
- **Think of it as**: Data contracts - "this is what the data must look like"
- **Used for**: Request bodies, response models, data transfer objects (DTOs)

### 3. **Models** (`app/models/` - if using ORM)
**Purpose**: Define database table structures

```python
# app/models/user.py
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    created_at = Column(DateTime)
```

- **What they do**: Map Python classes to database tables
- **Responsibility**: Define database schema
- **Think of it as**: Database blueprints

### 4. **Queries** (`app/queries/`)
**Purpose**: Raw SQL queries or database operations

```python
# app/queries.py
def get_user_by_email(cursor, email):
    cursor.execute(
        "SELECT * FROM users WHERE email = %s",
        (email,)
    )
    return cursor.fetchone()
```

- **What they do**: Interact directly with database
- **Responsibility**: Execute SQL, fetch results
- **Think of it as**: Database access layer

### 5. **Services** (`app/services/`)
**Purpose**: Business logic and orchestration

```python
# app/services/user_service.py
class UserService:
    def create_user_with_welcome_email(self, user_data):
        # 1. Create user in database
        user = create_user_in_db(user_data)
        # 2. Send welcome email
        send_welcome_email(user.email)
        # 3. Create default settings
        create_default_settings(user.id)
        # 4. Log the event
        log_user_creation(user.id)
        return user
```

- **What they do**: Complex business operations
- **Responsibility**: Orchestrate multiple operations, implement business rules
- **Think of it as**: The "brain" - where business decisions are made

### 6. **Utils** (`app/utils.py`)
**Purpose**: Shared helper functions

```python
# app/utils.py
def generate_random_token():
    return secrets.token_urlsafe(32)

def format_phone_number(phone):
    return phone.replace("-", "").replace(" ", "")
```

- **What they do**: Reusable utility functions
- **Responsibility**: Common operations used across the app
- **Think of it as**: Your toolbox

### 7. **Scripts** (`scripts/`)
**Purpose**: Standalone tasks run outside the web server

```python
# scripts/cleanup_old_files.py
# Run with: python scripts/cleanup_old_files.py
def cleanup():
    delete_files_older_than(days=30)
```

- **What they do**: Maintenance, cron jobs, data migration
- **Responsibility**: Background tasks, scheduled jobs
- **Think of it as**: Housekeeping tasks
- **Examples**: Database cleanup, sending newsletters, data exports

### 8. **Config** (`app/config.py`)
**Purpose**: Application settings and environment variables

```python
# app/config.py
class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL")
    JWT_SECRET = os.getenv("JWT_SECRET")
    DEBUG = os.getenv("DEBUG", False)
```

- **What they do**: Centralize configuration
- **Responsibility**: Manage environment-specific settings
- **Think of it as**: Control panel for your app

### 9. **Auth** (`app/auth.py`)
**Purpose**: Authentication and authorization

```python
# app/auth.py
def get_current_user(token: str):
    # Verify JWT token
    # Return user if valid
    # Raise exception if invalid
```

- **What they do**: Handle security
- **Responsibility**: Verify users, check permissions
- **Think of it as**: The security guard

### 10. **Database** (`app/database.py`)
**Purpose**: Database connection management

```python
# app/database.py
def get_db():
    connection = create_connection()
    try:
        yield connection
    finally:
        connection.close()
```

- **What they do**: Manage database connections
- **Responsibility**: Connection pooling, session management
- **Think of it as**: The database manager

### 11. **Middleware** (`app/middleware/`)
**Purpose**: Process requests/responses globally

```python
# app/middleware/logging.py
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"{request.url.path} took {process_time}s")
    return response
```

- **What they do**: Intercept and process all requests/responses
- **Responsibility**: Logging, rate limiting, authentication checks
- **Think of it as**: Global filters/interceptors

## How Components Work Together

Here's a typical request flow through the architecture:

```
1. HTTP Request arrives
   ↓
2. Middleware processes request (logging, rate limiting)
   ↓
3. Router receives request at specific endpoint
   ↓
4. Router validates input with Schema
   ↓
5. Router checks Auth (if protected endpoint)
   ↓
6. Router calls Service layer (business logic)
   ↓
7. Service uses Queries/Models to access database
   ↓
8. Database returns raw data
   ↓
9. Service processes data (maybe uses Utils)
   ↓
10. Service returns processed data to Router
    ↓
11. Router formats response with output Schema
    ↓
12. Middleware processes response
    ↓
13. HTTP Response sent to client
```

### Real-World Example Flow

When a client calls `POST /api/v1/users` to create a new user:

1. **Middleware** logs the incoming request
2. **Router** (`users.py`) receives POST request
3. **Schema** (`UserCreate`) validates the request body
4. **Auth** verifies the user has permission to create users
5. **Service** (`UserService`) handles business logic:
   - Checks if email already exists
   - Hashes the password
   - Creates user in database
   - Sends welcome email
   - Creates default preferences
6. **Queries** execute SQL to insert user
7. **Database** returns the created user data
8. **Schema** (`User`) formats the response
9. **Router** returns 201 Created with user data
10. **Middleware** logs response time

Each component has **one responsibility** and does it well - this is called "separation of concerns" and it's why this structure scales so well in industry.

## Conclusion

This modular structure is the industry standard because it:
1. **Scales** with your application
2. **Separates concerns** clearly
3. **Enables team collaboration**
4. **Simplifies testing**
5. **Improves maintainability**

Start with this structure even for small projects - it's easier to start organized than to refactor later!