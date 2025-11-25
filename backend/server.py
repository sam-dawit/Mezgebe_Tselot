from fastapi import FastAPI, HTTPException, Query, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import os
from dotenv import load_dotenv
from bson import ObjectId
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import random
import string

load_dotenv()

app = FastAPI()

# MongoDB Connection
MONGODB_URL = os.getenv("MONGODB_URL")
DB_NAME = os.getenv("DB_NAME")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DB_NAME]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Pydantic Models
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

class Book(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    name_english: str
    name_amharic: str
    chapters: int
    category: str
    testament: Optional[str] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Verse(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    book: str
    chapter: int
    verse: int
    text_english: str
    text_amharic: str

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Commentary(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    verse_id: str
    text_english: str
    text_amharic: str

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class User(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    username: str
    email: EmailStr
    phone_number: Optional[str] = None
    two_factor_method: str = "none" # none, sms, email
    disabled: Optional[bool] = False

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class UserInDB(User):
    hashed_password: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    phone_number: Optional[str] = None
    password: str
    two_factor_method: str = "none"

class Token(BaseModel):
    access_token: str
    token_type: str
    two_factor_required: bool = False
    temp_token: Optional[str] = None

class Verify2FARequest(BaseModel):
    temp_token: str
    code: str

class Location(BaseModel):
    type: str = "Point"
    coordinates: List[float] # [longitude, latitude]

class Church(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    name: str
    description: Optional[str] = None
    state: str
    address: Optional[str] = None
    website: Optional[str] = None
    location: Optional[Location] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

# Auth Utils
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await db.users.find_one({"username": username})
    if user is None:
        raise credentials_exception
    user["_id"] = str(user["_id"])
    return User(**user)

# Routes

@app.get("/api/")
async def health_check():
    return {"message": "Bible API Server"}

# Auth Routes
@app.post("/api/auth/register", response_model=Token)
async def register(user: UserCreate):
    existing_user = await db.users.find_one({
        "$or": [
            {"username": user.username},
            {"email": user.email},
            {"phone_number": user.phone_number}
        ]
    })
    if existing_user:
        print(f"Registration failed. Collision found for user: {user.username}")
        if existing_user.get("username") == user.username:
            print(f"Collision on USERNAME: {user.username}")
        if existing_user.get("email") == user.email:
            print(f"Collision on EMAIL: {user.email}")
        if user.phone_number and existing_user.get("phone_number") == user.phone_number:
            print(f"Collision on PHONE: {user.phone_number}")
            
        raise HTTPException(status_code=400, detail="Username, email, or phone already registered")
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict["hashed_password"] = hashed_password
    del user_dict["password"]
    
    await db.users.insert_one(user_dict)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Allow login with username, email, or phone
    user = await db.users.find_one({
        "$or": [
            {"username": form_data.username},
            {"email": form_data.username},
            {"phone_number": form_data.username}
        ]
    })
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check 2FA
    if user.get("two_factor_method") in ["sms", "email"]:
        # Generate 6-digit code
        code = "".join(random.choices(string.digits, k=6))
        
        # Store code in DB with expiry (using a simple collection for now)
        temp_token = "".join(random.choices(string.ascii_letters + string.digits, k=32))
        await db.verification_codes.insert_one({
            "temp_token": temp_token,
            "user_id": user["_id"],
            "code": code,
            "created_at": datetime.utcnow()
        })
        
        # MOCK SENDING
        print(f"============================================")
        print(f"MOCK {user.get('two_factor_method').upper()} SENT TO {user.get('username')}")
        print(f"VERIFICATION CODE: {code}")
        print(f"============================================")
        
        return {
            "access_token": "", 
            "token_type": "bearer", 
            "two_factor_required": True,
            "temp_token": temp_token
        }
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "two_factor_required": False}

@app.post("/api/auth/verify-2fa", response_model=Token)
async def verify_2fa(request: Verify2FARequest):
    # Find verification record
    record = await db.verification_codes.find_one({"temp_token": request.temp_token})
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired session")
        
    # Check code
    if record["code"] != request.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
        
    # Check expiry (e.g., 5 minutes)
    if (datetime.utcnow() - record["created_at"]).total_seconds() > 300:
        await db.verification_codes.delete_one({"_id": record["_id"]})
        raise HTTPException(status_code=400, detail="Verification code expired")
        
    # Get user
    user = await db.users.find_one({"_id": record["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Clean up used code
    await db.verification_codes.delete_one({"_id": record["_id"]})
    
    # Generate Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "two_factor_required": False}

@app.get("/api/auth/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Church Routes
@app.get("/api/churches", response_model=List[Church])
async def get_churches(state: Optional[str] = None):
    print(f"GET /api/churches called with state={state}")
    query = {}
    if state:
        query["state"] = state
    churches = await db.churches.find(query).to_list(1000)
    for church in churches:
        church["_id"] = str(church["_id"])
    return churches

@app.get("/api/churches/nearby", response_model=List[Church])
async def get_nearby_churches(lat: float, long: float, max_distance: int = 5000):
    # Ensure 2dsphere index exists
    await db.churches.create_index([("location", "2dsphere")])
    
    churches = await db.churches.find({
        "location": {
            "$near": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [long, lat]
                },
                "$maxDistance": max_distance
            }
        }
    }).to_list(50)
    
    for church in churches:
        church["_id"] = str(church["_id"])
    return churches

# Existing Routes
@app.get("/api/books", response_model=List[Book])
async def get_books():
    books = await db.books.find().to_list(1000)
    for book in books:
        book["_id"] = str(book["_id"])
    return books

@app.get("/api/books/{book}/chapters/{chapter}", response_model=List[Verse])
async def get_chapter_verses(book: str, chapter: int):
    verses = await db.verses.find({"book": book, "chapter": chapter}).sort("verse", 1).to_list(1000)
    for verse in verses:
        verse["_id"] = str(verse["_id"])
    return verses

@app.get("/api/commentary/{verse_id}", response_model=Commentary)
async def get_commentary(verse_id: str):
    commentary = await db.commentaries.find_one({"verse_id": verse_id})
    if commentary:
        commentary["_id"] = str(commentary["_id"])
        return commentary
    raise HTTPException(status_code=404, detail="Commentary not found")

@app.get("/api/search", response_model=List[Verse])
async def search_verses(q: str = Query(..., min_length=2), language: str = "english"):
    query = {}
    if language == "english":
        query["text_english"] = {"$regex": q, "$options": "i"}
    else:
        query["text_amharic"] = {"$regex": q, "$options": "i"}
    
    verses = await db.verses.find(query).limit(50).to_list(50)
    for verse in verses:
        verse["_id"] = str(verse["_id"])
    return verses

@app.get("/api/version")
async def get_version():
    version = await db.versions.find_one()
    if version:
        version["_id"] = str(version["_id"])
        return version
    return {"version": "1.0.0", "last_updated": "2025-01-10T00:00:00Z"}

# Data Initialization (Sample Data)
@app.post("/api/init-data")
async def init_data():
    # Clear existing data
    await db.books.delete_many({})
    await db.verses.delete_many({})
    await db.commentaries.delete_many({})
    await db.churches.delete_many({})

    # Sample Books
    books = [
        {"name_english": "Genesis", "name_amharic": "ዘፍጥረት", "chapters": 50, "category": "Bible"},
        {"name_english": "John", "name_amharic": "ዮሐንስ", "chapters": 21, "category": "Bible"},
    ]
    await db.books.insert_many(books)

    # Sample Verses (Genesis 1:1-3)
    verses = [
        {"book": "Genesis", "chapter": 1, "verse": 1, "text_english": "In the beginning God created the heaven and the earth.", "text_amharic": "በመጀመሪያ እግዚአብሔር ሰማይንና ምድርን ፈጠረ።"},
        {"book": "Genesis", "chapter": 1, "verse": 2, "text_english": "And the earth was without form, and void; and darkness was upon the face of the deep.", "text_amharic": "ምድርም ባዶ ነበረች፥ አንዳችም አልነበረባትም፤ ጨለማም በጥልቁ ላይ ነበረ።"},
        {"book": "Genesis", "chapter": 1, "verse": 3, "text_english": "And God said, Let there be light: and there was light.", "text_amharic": "እግዚአብሔርም፦ ብርሃን ይሁን አለ፤ ብርሃንም ሆነ።"}
    ]
    result = await db.verses.insert_many(verses)
    verse_ids = result.inserted_ids

    # Sample Commentary
    commentaries = [
        {"verse_id": str(verse_ids[0]), "text_english": "This is the first verse of the Bible, describing the creation of the universe.", "text_amharic": "ይህ የመጽሐፍ ቅዱስ የመጀመሪያው ጥቅስ ሲሆን የዓለምን መፈጠር ይገልጻል።"}
    ]
    await db.commentaries.insert_many(commentaries)

    # Load Churches from JSON file
    import json
    try:
        with open("churches.json", "r") as f:
            data = json.load(f)
            churches_list = []
            
            # Iterate through the flat list
            for church in data:
                # Skip if no location data (optional, but good for map)
                # if not church.get("location"):
                #     continue

                # Construct full address
                street = church.get('street', '')
                city = church.get('city', '')
                state = church.get('state', '')
                zip_code = church.get('zipCode', '')
                full_address = f"{street}, {city}, {state} {zip_code}".strip().strip(",")
                
                church_doc = {
                    "name": church.get("title"),
                    "description": church.get("website") or "No website available",
                    "state": state,
                    "address": full_address,
                    "website": church.get("website") or "",
                    "location": church.get("location")
                }
                churches_list.append(church_doc)
            
            if churches_list:
                await db.churches.insert_many(churches_list)
                await db.churches.create_index([("location", "2dsphere")])
    except Exception as e:
        print(f"Error loading churches: {e}")

    return {"message": "Sample data initialized"}
