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

## API Key Authentication Header
- difficulty: medium

```python
from fastapi import FastAPI, Security, HTTPException, status
from fastapi.security import APIKeyHeader

app = FastAPI()

API_KEY = "your-secret-api-key"
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key"
        )
    return api_key

@app.get("/protected")
async def protected_route(api_key: str = Security(verify_api_key)):
    return {"message": "Access granted", "api_key": api_key[:8] + "..."}
```

## API Key Authentication Query
- difficulty: medium

```python
from fastapi import FastAPI, Security, HTTPException, status
from fastapi.security import APIKeyQuery

app = FastAPI()

API_KEYS = {"key1": "user1", "key2": "user2"}
api_key_query = APIKeyQuery(name="api_key", auto_error=False)

async def get_api_key(api_key: str = Security(api_key_query)):
    if api_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API Key required"
        )
    if api_key not in API_KEYS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API Key"
        )
    return API_KEYS[api_key]

@app.get("/data")
async def get_data(user: str = Security(get_api_key)):
    return {"message": f"Hello {user}"}
```

## API Key Multiple Sources
- difficulty: hard

```python
from fastapi import FastAPI, Security, HTTPException, status
from fastapi.security import APIKeyHeader, APIKeyQuery, APIKeyCookie
from typing import Optional

app = FastAPI()

API_KEYS = {"secret-key-123": "admin", "secret-key-456": "user"}

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
api_key_query = APIKeyQuery(name="api_key", auto_error=False)
api_key_cookie = APIKeyCookie(name="api_key", auto_error=False)

async def get_api_key(
    header_key: Optional[str] = Security(api_key_header),
    query_key: Optional[str] = Security(api_key_query),
    cookie_key: Optional[str] = Security(api_key_cookie),
):
    api_key = header_key or query_key or cookie_key

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API Key required (header, query, or cookie)"
        )

    if api_key not in API_KEYS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API Key"
        )

    return {"key": api_key, "user": API_KEYS[api_key]}

@app.get("/secure")
async def secure_endpoint(auth: dict = Security(get_api_key)):
    return {"user": auth["user"], "message": "Authenticated"}
```

## Basic Offset Pagination
- difficulty: easy

```python
from fastapi import FastAPI, Query
from typing import List, Generic, TypeVar
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    id: int
    name: str

class PaginatedResponse(BaseModel):
    items: List[Item]
    total: int
    page: int
    page_size: int
    total_pages: int

@app.get("/items", response_model=PaginatedResponse)
async def get_items(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100)
):
    total = 100
    offset = (page - 1) * page_size

    items = [Item(id=i, name=f"Item {i}") for i in range(offset, min(offset + page_size, total))]

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )
```

## Pagination Dependency
- difficulty: medium

```python
from fastapi import FastAPI, Depends, Query
from pydantic import BaseModel
from typing import Generic, TypeVar, List

app = FastAPI()

T = TypeVar("T")

class PaginationParams:
    def __init__(
        self,
        skip: int = Query(default=0, ge=0, description="Number of items to skip"),
        limit: int = Query(default=20, ge=1, le=100, description="Number of items to return"),
    ):
        self.skip = skip
        self.limit = limit

class Page(BaseModel, Generic[T]):
    items: List[T]
    total: int
    skip: int
    limit: int
    has_more: bool

def paginate(items: List, total: int, params: PaginationParams) -> dict:
    return {
        "items": items,
        "total": total,
        "skip": params.skip,
        "limit": params.limit,
        "has_more": params.skip + params.limit < total
    }

@app.get("/users")
async def get_users(pagination: PaginationParams = Depends()):
    total = 100
    users = db.query(User).offset(pagination.skip).limit(pagination.limit).all()
    return paginate(users, total, pagination)
```

## Cursor-based Pagination
- difficulty: hard

```python
from fastapi import FastAPI, Query, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import base64
import json

app = FastAPI()

class Item(BaseModel):
    id: str
    name: str
    created_at: str

class CursorPage(BaseModel):
    items: List[Item]
    next_cursor: Optional[str] = None
    prev_cursor: Optional[str] = None
    has_next: bool
    has_prev: bool

def encode_cursor(data: dict) -> str:
    return base64.urlsafe_b64encode(json.dumps(data).encode()).decode()

def decode_cursor(cursor: str) -> dict:
    try:
        return json.loads(base64.urlsafe_b64decode(cursor.encode()).decode())
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid cursor")

@app.get("/items", response_model=CursorPage)
async def get_items(
    cursor: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    direction: str = Query(default="next", regex="^(next|prev)$")
):
    if cursor:
        cursor_data = decode_cursor(cursor)
        last_id = cursor_data["id"]
        last_created = cursor_data["created_at"]
    else:
        last_id = None
        last_created = None

    query = db.query(Item).order_by(Item.created_at.desc(), Item.id.desc())

    if last_id and direction == "next":
        query = query.filter(
            (Item.created_at < last_created) |
            ((Item.created_at == last_created) & (Item.id < last_id))
        )

    items = query.limit(limit + 1).all()
    has_next = len(items) > limit
    items = items[:limit]

    next_cursor = None
    if has_next and items:
        last = items[-1]
        next_cursor = encode_cursor({"id": last.id, "created_at": last.created_at})

    return CursorPage(
        items=items,
        next_cursor=next_cursor,
        prev_cursor=cursor,
        has_next=has_next,
        has_prev=cursor is not None
    )
```

## Pagination with SQLAlchemy
- difficulty: medium

```python
from fastapi import FastAPI, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Generic, TypeVar
from pydantic import BaseModel

app = FastAPI()

T = TypeVar("T")

class PageParams(BaseModel):
    page: int = 1
    size: int = 20

class PagedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    pages: int

async def get_pagination(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
) -> PageParams:
    return PageParams(page=page, size=size)

def paginate_query(
    db: Session,
    query,
    params: PageParams,
    response_model
) -> PagedResponse:
    total = query.count()
    items = query.offset((params.page - 1) * params.size).limit(params.size).all()

    return PagedResponse(
        items=[response_model.model_validate(item) for item in items],
        total=total,
        page=params.page,
        size=params.size,
        pages=(total + params.size - 1) // params.size
    )

@app.get("/users", response_model=PagedResponse[UserResponse])
async def get_users(
    db: Session = Depends(get_db),
    params: PageParams = Depends(get_pagination),
    search: str = Query(default=None)
):
    query = db.query(User)
    if search:
        query = query.filter(User.name.ilike(f"%{search}%"))
    return paginate_query(db, query, params, UserResponse)
```

## JSONResponse Custom
- difficulty: easy

```python
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from typing import Any
import json
from datetime import datetime, date
from decimal import Decimal

app = FastAPI()

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj: Any) -> Any:
        if isinstance(obj, datetime):
            return obj.isoformat()
        if isinstance(obj, date):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

class CustomJSONResponse(JSONResponse):
    def render(self, content: Any) -> bytes:
        return json.dumps(
            content,
            cls=CustomJSONEncoder,
            ensure_ascii=False,
            indent=2
        ).encode("utf-8")

@app.get("/data", response_class=CustomJSONResponse)
async def get_data():
    return {
        "name": "สวัสดี",
        "created_at": datetime.now(),
        "price": Decimal("19.99")
    }
```

## Response Classes
- difficulty: medium

```python
from fastapi import FastAPI
from fastapi.responses import (
    JSONResponse, HTMLResponse, PlainTextResponse,
    RedirectResponse, FileResponse, StreamingResponse
)
from pathlib import Path

app = FastAPI()

@app.get("/json")
async def json_response():
    return JSONResponse(
        content={"message": "Hello"},
        status_code=200,
        headers={"X-Custom-Header": "value"}
    )

@app.get("/html", response_class=HTMLResponse)
async def html_response():
    return """
    <html>
        <head><title>Hello</title></head>
        <body><h1>Hello World</h1></body>
    </html>
    """

@app.get("/text", response_class=PlainTextResponse)
async def text_response():
    return "Hello, World!"

@app.get("/redirect")
async def redirect():
    return RedirectResponse(url="/new-location", status_code=307)

@app.get("/file")
async def file_response():
    return FileResponse(
        path="./files/report.pdf",
        filename="report.pdf",
        media_type="application/pdf"
    )

@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = Path(f"./uploads/{filename}")
    if not file_path.exists():
        return JSONResponse(status_code=404, content={"error": "File not found"})
    return FileResponse(path=file_path, filename=filename)
```

## ORJSONResponse for Performance
- difficulty: easy

```python
from fastapi import FastAPI
from fastapi.responses import ORJSONResponse
from typing import List
from pydantic import BaseModel

app = FastAPI(default_response_class=ORJSONResponse)

class Item(BaseModel):
    id: int
    name: str
    price: float

@app.get("/items", response_class=ORJSONResponse)
async def get_items() -> List[Item]:
    return [
        Item(id=1, name="Item 1", price=10.5),
        Item(id=2, name="Item 2", price=20.0),
    ]

@app.get("/large-data")
async def get_large_data():
    data = [{"id": i, "value": f"item_{i}"} for i in range(10000)]
    return ORJSONResponse(content=data)
```

## Custom Response with Headers
- difficulty: medium

```python
from fastapi import FastAPI, Response
from fastapi.responses import JSONResponse
from typing import Any

app = FastAPI()

@app.get("/custom")
async def custom_response(response: Response):
    response.headers["X-Custom-Header"] = "custom-value"
    response.headers["Cache-Control"] = "max-age=3600"
    response.set_cookie(key="visited", value="true")
    return {"message": "Hello"}

@app.get("/no-cache")
async def no_cache():
    return JSONResponse(
        content={"data": "sensitive"},
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )

@app.get("/cors-custom")
async def cors_response():
    return JSONResponse(
        content={"message": "CORS enabled"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    )
```

## Pydantic Field Validators
- difficulty: medium

```python
from pydantic import BaseModel, field_validator, ValidationError
from typing import List

class User(BaseModel):
    name: str
    email: str
    age: int
    tags: List[str] = []

    @field_validator('name')
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip().title()

    @field_validator('email')
    @classmethod
    def email_must_be_valid(cls, v: str) -> str:
        if '@' not in v:
            raise ValueError('Invalid email format')
        return v.lower()

    @field_validator('age')
    @classmethod
    def age_must_be_valid(cls, v: int) -> int:
        if v < 0 or v > 150:
            raise ValueError('Age must be between 0 and 150')
        return v

    @field_validator('tags', mode='before')
    @classmethod
    def split_tags(cls, v):
        if isinstance(v, str):
            return [tag.strip() for tag in v.split(',')]
        return v
```

## Pydantic Model Validators
- difficulty: hard

```python
from pydantic import BaseModel, model_validator, field_validator
from typing import Optional
from datetime import date

class DateRange(BaseModel):
    start_date: date
    end_date: date

    @model_validator(mode='after')
    def validate_date_range(self) -> 'DateRange':
        if self.end_date < self.start_date:
            raise ValueError('end_date must be after start_date')
        return self

class UserRegistration(BaseModel):
    username: str
    password: str
    password_confirm: str
    email: Optional[str] = None
    phone: Optional[str] = None

    @model_validator(mode='after')
    def validate_passwords_match(self) -> 'UserRegistration':
        if self.password != self.password_confirm:
            raise ValueError('Passwords do not match')
        return self

    @model_validator(mode='after')
    def validate_contact_info(self) -> 'UserRegistration':
        if not self.email and not self.phone:
            raise ValueError('Either email or phone must be provided')
        return self

class OrderItem(BaseModel):
    product_id: str
    quantity: int
    unit_price: float
    discount: float = 0

    @model_validator(mode='after')
    def validate_discount(self) -> 'OrderItem':
        max_discount = self.unit_price * self.quantity
        if self.discount > max_discount:
            raise ValueError(f'Discount cannot exceed {max_discount}')
        return self
```

## Pydantic Computed Fields
- difficulty: medium

```python
from pydantic import BaseModel, computed_field, field_validator
from typing import List
from decimal import Decimal

class OrderItem(BaseModel):
    name: str
    quantity: int
    unit_price: Decimal

    @computed_field
    @property
    def subtotal(self) -> Decimal:
        return self.quantity * self.unit_price

class Order(BaseModel):
    items: List[OrderItem]
    tax_rate: Decimal = Decimal("0.1")
    discount: Decimal = Decimal("0")

    @computed_field
    @property
    def subtotal(self) -> Decimal:
        return sum(item.subtotal for item in self.items)

    @computed_field
    @property
    def tax(self) -> Decimal:
        return (self.subtotal - self.discount) * self.tax_rate

    @computed_field
    @property
    def total(self) -> Decimal:
        return self.subtotal - self.discount + self.tax

class User(BaseModel):
    first_name: str
    last_name: str
    birth_year: int

    @computed_field
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    @computed_field
    @property
    def age(self) -> int:
        from datetime import datetime
        return datetime.now().year - self.birth_year
```

## Pydantic Model Config
- difficulty: medium

```python
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        str_min_length=1,
        from_attributes=True,
        populate_by_name=True,
        use_enum_values=True,
        validate_default=True,
        extra='forbid',
    )

class User(UserBase):
    id: int
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., pattern=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    full_name: Optional[str] = Field(None, alias='fullName')
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": 1,
                "username": "johndoe",
                "email": "john@example.com",
                "fullName": "John Doe"
            }
        }
    )

class UserFromDB(User):
    model_config = ConfigDict(from_attributes=True)

user = UserFromDB.model_validate(db_user)
```

## Pydantic Custom Types
- difficulty: hard

```python
from pydantic import BaseModel, GetCoreSchemaHandler
from pydantic_core import CoreSchema, core_schema
from typing import Annotated, Any
import re

class PhoneNumber(str):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: GetCoreSchemaHandler
    ) -> CoreSchema:
        return core_schema.no_info_after_validator_function(
            cls._validate,
            core_schema.str_schema(),
        )

    @classmethod
    def _validate(cls, v: str) -> 'PhoneNumber':
        phone = re.sub(r'[\s\-\(\)]', '', v)
        if not re.match(r'^\+?[0-9]{10,15}$', phone):
            raise ValueError('Invalid phone number format')
        return cls(phone)

class Slug(str):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: GetCoreSchemaHandler
    ) -> CoreSchema:
        return core_schema.no_info_after_validator_function(
            cls._validate,
            core_schema.str_schema(),
        )

    @classmethod
    def _validate(cls, v: str) -> 'Slug':
        slug = re.sub(r'[^\w\-]', '', v.lower().replace(' ', '-'))
        if not slug:
            raise ValueError('Invalid slug')
        return cls(slug)

class Contact(BaseModel):
    name: str
    phone: PhoneNumber

class Article(BaseModel):
    title: str
    slug: Slug
```

## Pydantic Nested Models
- difficulty: medium

```python
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class Status(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class Author(BaseModel):
    id: int
    name: str
    email: str

class Tag(BaseModel):
    id: int
    name: str
    slug: str

class Comment(BaseModel):
    id: int
    content: str
    author: Author
    created_at: datetime

class Post(BaseModel):
    id: int
    title: str
    content: str
    status: Status = Status.DRAFT
    author: Author
    tags: List[Tag] = []
    comments: List[Comment] = []
    metadata: Optional[dict] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=10)
    author_id: int
    tag_ids: List[int] = []

class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=10)
    status: Optional[Status] = None
    tag_ids: Optional[List[int]] = None
```

## Pydantic Serialization
- difficulty: medium

```python
from pydantic import BaseModel, Field, field_serializer
from datetime import datetime
from decimal import Decimal
from typing import Optional

class Product(BaseModel):
    id: int
    name: str
    price: Decimal
    discount_price: Optional[Decimal] = None
    created_at: datetime
    secret_key: str = Field(exclude=True)

    @field_serializer('price', 'discount_price')
    def serialize_decimal(self, v: Optional[Decimal]) -> Optional[str]:
        if v is None:
            return None
        return f"${v:.2f}"

    @field_serializer('created_at')
    def serialize_datetime(self, v: datetime) -> str:
        return v.strftime("%Y-%m-%d %H:%M:%S")

class User(BaseModel):
    id: int
    email: str
    password: str = Field(exclude=True)
    phone: Optional[str] = None

    def model_dump_public(self) -> dict:
        return self.model_dump(exclude={'password'}, exclude_none=True)

    def model_dump_admin(self) -> dict:
        data = self.model_dump()
        data['password'] = '***hidden***'
        return data

product = Product(
    id=1, name="Widget", price=Decimal("29.99"),
    created_at=datetime.now(), secret_key="abc123"
)
print(product.model_dump_json())
```

## Pydantic Generic Models
- difficulty: hard

```python
from pydantic import BaseModel
from typing import TypeVar, Generic, List, Optional
from datetime import datetime

T = TypeVar('T')

class Response(BaseModel, Generic[T]):
    success: bool = True
    data: T
    message: Optional[str] = None
    timestamp: datetime = datetime.utcnow()

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool

class User(BaseModel):
    id: int
    name: str
    email: str

class Product(BaseModel):
    id: int
    name: str
    price: float

@app.get("/users/{user_id}", response_model=Response[User])
async def get_user(user_id: int):
    user = await fetch_user(user_id)
    return Response(data=user, message="User found")

@app.get("/products", response_model=PaginatedResponse[Product])
async def list_products(page: int = 1, size: int = 20):
    products, total = await fetch_products(page, size)
    return PaginatedResponse(
        items=products,
        total=total,
        page=page,
        page_size=size,
        has_next=page * size < total,
        has_prev=page > 1
    )
```
