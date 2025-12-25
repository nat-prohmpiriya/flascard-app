# FastAPI Snippets

## Hello World
- difficulty: easy

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

## Path Parameters
- difficulty: easy

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id}

@app.get("/files/{file_path:path}")
async def get_file(file_path: str):
    return {"file_path": file_path}
```

## Query Parameters
- difficulty: easy

```python
from fastapi import FastAPI, Query
from typing import Optional

app = FastAPI()

@app.get("/items")
async def get_items(
    skip: int = 0,
    limit: int = Query(default=10, le=100),
    search: Optional[str] = None
):
    return {"skip": skip, "limit": limit, "search": search}
```

## Request Body with Pydantic
- difficulty: easy

```python
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr
from typing import Optional

app = FastAPI()

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    age: Optional[int] = None

@app.post("/users")
async def create_user(user: UserCreate):
    return {"message": "User created", "user": user}
```

## Pydantic Validation
- difficulty: medium

```python
from pydantic import BaseModel, Field, validator
from typing import List
from datetime import datetime

class Item(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0)
    quantity: int = Field(default=1, ge=1, le=1000)
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.title()

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Widget",
                "price": 9.99,
                "quantity": 10
            }
        }
```

## Response Model
- difficulty: medium

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

@app.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate):
    return {"id": 1, "name": user.name, "email": user.email}

@app.get("/users", response_model=List[UserResponse])
async def get_users():
    return [{"id": 1, "name": "John", "email": "john@example.com"}]
```

## HTTP Status Codes
- difficulty: easy

```python
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse

app = FastAPI()

@app.post("/items", status_code=status.HTTP_201_CREATED)
async def create_item(item: dict):
    return item

@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: int):
    return None

@app.get("/redirect")
async def redirect():
    return JSONResponse(
        status_code=status.HTTP_307_TEMPORARY_REDIRECT,
        headers={"Location": "/new-location"}
    )
```

## HTTPException
- difficulty: easy

```python
from fastapi import FastAPI, HTTPException, status

app = FastAPI()

items = {"foo": "The Foo Item"}

@app.get("/items/{item_id}")
async def get_item(item_id: str):
    if item_id not in items:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
            headers={"X-Error": "Item missing"}
        )
    return {"item": items[item_id]}
```

## Custom Exception Handler
- difficulty: medium

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

class CustomException(Exception):
    def __init__(self, name: str, code: int):
        self.name = name
        self.code = code

@app.exception_handler(CustomException)
async def custom_exception_handler(request: Request, exc: CustomException):
    return JSONResponse(
        status_code=exc.code,
        content={"error": exc.name, "path": str(request.url)}
    )

@app.get("/error")
async def raise_error():
    raise CustomException(name="Something went wrong", code=400)
```

## Dependency Injection
- difficulty: medium

```python
from fastapi import FastAPI, Depends
from typing import Annotated

app = FastAPI()

async def get_db():
    db = DatabaseSession()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme)):
    user = decode_token(token)
    return user

@app.get("/items")
async def get_items(
    db: Annotated[DatabaseSession, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)]
):
    return db.query(Item).filter(Item.owner_id == user.id).all()
```

## Dependency with Parameters
- difficulty: medium

```python
from fastapi import FastAPI, Depends, Query
from typing import Annotated

app = FastAPI()

class Pagination:
    def __init__(
        self,
        skip: int = Query(default=0, ge=0),
        limit: int = Query(default=10, ge=1, le=100)
    ):
        self.skip = skip
        self.limit = limit

@app.get("/items")
async def get_items(pagination: Annotated[Pagination, Depends()]):
    return {"skip": pagination.skip, "limit": pagination.limit}
```

## OAuth2 Password Bearer
- difficulty: medium

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Annotated

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.post("/token")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    return decode_token(token)
```

## JWT Authentication
- difficulty: hard

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"username": username}
```

## CORS Middleware
- difficulty: easy

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://myapp.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Custom Middleware
- difficulty: medium

```python
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
import time

app = FastAPI()

class TimingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response

app.add_middleware(TimingMiddleware)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    print(f"Response: {response.status_code}")
    return response
```

## Background Tasks
- difficulty: medium

```python
from fastapi import FastAPI, BackgroundTasks
from typing import Annotated

app = FastAPI()

def send_email(email: str, message: str):
    print(f"Sending email to {email}: {message}")

def write_log(message: str):
    with open("log.txt", "a") as f:
        f.write(f"{message}\n")

@app.post("/send-notification")
async def send_notification(
    email: str,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(send_email, email, "Welcome!")
    background_tasks.add_task(write_log, f"Email sent to {email}")
    return {"message": "Notification sent in background"}
```

## File Upload
- difficulty: medium

```python
from fastapi import FastAPI, UploadFile, File
from typing import List
import shutil

app = FastAPI()

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    with open(f"uploads/{file.filename}", "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "size": file.size}

@app.post("/upload-multiple")
async def upload_multiple_files(files: List[UploadFile] = File(...)):
    filenames = []
    for file in files:
        with open(f"uploads/{file.filename}", "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        filenames.append(file.filename)
    return {"filenames": filenames}
```

## Form Data
- difficulty: easy

```python
from fastapi import FastAPI, Form
from typing import Annotated

app = FastAPI()

@app.post("/login")
async def login(
    username: Annotated[str, Form()],
    password: Annotated[str, Form()]
):
    return {"username": username}

@app.post("/register")
async def register(
    username: Annotated[str, Form(min_length=3)],
    email: Annotated[str, Form()],
    password: Annotated[str, Form(min_length=8)]
):
    return {"username": username, "email": email}
```

## WebSocket
- difficulty: medium

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Client {client_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
```

## SQLAlchemy Integration
- difficulty: medium

```python
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi import Depends

DATABASE_URL = "postgresql://user:password@localhost/dbname"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    return db.query(User).filter(User.id == user_id).first()
```

## SQLAlchemy CRUD Operations
- difficulty: medium

```python
from sqlalchemy.orm import Session
from fastapi import HTTPException

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: UserUpdate):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in user.dict(exclude_unset=True).items():
        setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user
```

## Async SQLAlchemy
- difficulty: hard

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

DATABASE_URL = "postgresql+asyncpg://user:password@localhost/dbname"

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_async_db():
    async with AsyncSessionLocal() as session:
        yield session

@app.get("/users/{user_id}")
async def get_user(user_id: int, db: AsyncSession = Depends(get_async_db)):
    result = await db.execute(select(User).filter(User.id == user_id))
    return result.scalar_one_or_none()
```

## Router Organization
- difficulty: medium

```python
from fastapi import APIRouter, FastAPI

router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}}
)

@router.get("/")
async def get_users():
    return []

@router.get("/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id}

@router.post("/")
async def create_user(user: UserCreate):
    return user

app = FastAPI()
app.include_router(router)
app.include_router(items_router, prefix="/api/v1")
```

## Lifespan Events
- difficulty: medium

```python
from fastapi import FastAPI
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    app.state.db_pool = await create_pool()
    app.state.redis = await aioredis.create_redis_pool("redis://localhost")
    yield
    print("Shutting down...")
    await app.state.db_pool.close()
    app.state.redis.close()

app = FastAPI(lifespan=lifespan)

@app.get("/")
async def root():
    return {"message": "Hello"}
```

## Caching with Redis
- difficulty: medium

```python
from fastapi import FastAPI, Depends
import aioredis
import json

app = FastAPI()
redis = None

@app.on_event("startup")
async def startup():
    global redis
    redis = await aioredis.from_url("redis://localhost")

@app.on_event("shutdown")
async def shutdown():
    await redis.close()

async def get_cached_or_fetch(key: str, fetch_func, expire: int = 300):
    cached = await redis.get(key)
    if cached:
        return json.loads(cached)
    data = await fetch_func()
    await redis.setex(key, expire, json.dumps(data))
    return data

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return await get_cached_or_fetch(
        f"user:{user_id}",
        lambda: fetch_user_from_db(user_id)
    )
```

## Rate Limiting
- difficulty: medium

```python
from fastapi import FastAPI, Request, HTTPException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/limited")
@limiter.limit("5/minute")
async def limited_endpoint(request: Request):
    return {"message": "This endpoint is rate limited"}

@app.get("/api")
@limiter.limit("100/hour")
async def api_endpoint(request: Request):
    return {"message": "API response"}
```

## Testing with pytest
- difficulty: medium

```python
from fastapi.testclient import TestClient
from main import app
import pytest

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_create_user():
    response = client.post(
        "/users",
        json={"name": "John", "email": "john@example.com"}
    )
    assert response.status_code == 201
    assert response.json()["name"] == "John"

@pytest.fixture
def auth_header():
    response = client.post("/token", data={"username": "test", "password": "test"})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_protected_endpoint(auth_header):
    response = client.get("/users/me", headers=auth_header)
    assert response.status_code == 200
```

## Async Testing
- difficulty: hard

```python
import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_async_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200

@pytest.fixture
async def async_client():
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.mark.asyncio
async def test_create_user(async_client):
    response = await async_client.post(
        "/users",
        json={"name": "John", "email": "john@example.com"}
    )
    assert response.status_code == 201
```

## OpenAPI Documentation
- difficulty: easy

```python
from fastapi import FastAPI

app = FastAPI(
    title="My API",
    description="API for managing resources",
    version="1.0.0",
    terms_of_service="http://example.com/terms/",
    contact={
        "name": "API Support",
        "email": "support@example.com"
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT"
    },
    openapi_tags=[
        {"name": "users", "description": "User operations"},
        {"name": "items", "description": "Item operations"}
    ]
)

@app.get("/users", tags=["users"], summary="Get all users")
async def get_users():
    """
    Retrieve all users from the database.

    - **skip**: number of records to skip
    - **limit**: maximum number of records to return
    """
    return []
```

## Streaming Response
- difficulty: medium

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio

app = FastAPI()

async def generate_data():
    for i in range(10):
        yield f"data: {i}\n\n"
        await asyncio.sleep(1)

@app.get("/stream")
async def stream():
    return StreamingResponse(
        generate_data(),
        media_type="text/event-stream"
    )

async def generate_file():
    for chunk in read_file_in_chunks("large_file.csv"):
        yield chunk

@app.get("/download")
async def download_file():
    return StreamingResponse(
        generate_file(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=data.csv"}
    )
```

## Request Validation with Headers
- difficulty: medium

```python
from fastapi import FastAPI, Header, HTTPException
from typing import Annotated, Optional

app = FastAPI()

@app.get("/items")
async def get_items(
    x_token: Annotated[str, Header()],
    x_request_id: Annotated[Optional[str], Header()] = None
):
    if x_token != "secret-token":
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"X-Request-ID": x_request_id}

@app.get("/api")
async def api_endpoint(
    user_agent: Annotated[str, Header()],
    accept_language: Annotated[str, Header()] = "en"
):
    return {"user_agent": user_agent, "language": accept_language}
```

## Cookie Handling
- difficulty: medium

```python
from fastapi import FastAPI, Cookie, Response
from typing import Annotated, Optional

app = FastAPI()

@app.get("/items")
async def get_items(
    session_id: Annotated[Optional[str], Cookie()] = None
):
    return {"session_id": session_id}

@app.post("/login")
async def login(response: Response):
    response.set_cookie(
        key="session_id",
        value="abc123",
        httponly=True,
        max_age=3600,
        secure=True,
        samesite="lax"
    )
    return {"message": "Logged in"}

@app.post("/logout")
async def logout(response: Response):
    response.delete_cookie("session_id")
    return {"message": "Logged out"}
```

## Environment Configuration
- difficulty: medium

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    app_name: str = "My App"
    debug: bool = False
    database_url: str
    redis_url: str = "redis://localhost"
    secret_key: str
    allowed_hosts: list[str] = ["*"]

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()

@app.get("/info")
async def info():
    return {
        "app_name": settings.app_name,
        "debug": settings.debug
    }
```

## Health Check Endpoint
- difficulty: easy

```python
from fastapi import FastAPI
from datetime import datetime

app = FastAPI()

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/ready")
async def readiness():
    db_ok = await check_database()
    redis_ok = await check_redis()

    if db_ok and redis_ok:
        return {"status": "ready"}
    return {"status": "not ready", "checks": {"db": db_ok, "redis": redis_ok}}
```
