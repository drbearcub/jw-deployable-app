from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from models.user import User, UserCreate
from database import users_collection
from dotenv import load_dotenv
import os
import re

load_dotenv(dotenv_path='.env.local')

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

class AuthService:
    async def verify_password(self, plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    async def get_password_hash(self, password):
        return pwd_context.hash(password)

    async def get_user_by_email(self, email: str):
        user_dict = await users_collection.find_one({"email": email})
        if user_dict:
            # Convert ObjectId to string for the id field
            user_dict['_id'] = str(user_dict['_id'])
            return User(**user_dict)

    async def authenticate_user(self, email: str, password: str):
        user = await self.get_user_by_email(email)
        if not user:
            return False
        if not await self.verify_password(password, user.hashed_password):
            return False
        return user

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    async def get_current_user(self, token: str = Depends(oauth2_scheme)):
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                raise credentials_exception
        except JWTError:
            raise credentials_exception
        user = await self.get_user_by_email(email)
        if user is None:
            raise credentials_exception
        return user

    def is_password_strong(self, password: str) -> bool:
        # Check if password is at least 8 characters long
        if len(password) < 8:
            return False
        # Check if password contains at least one uppercase letter, one lowercase letter, one digit, and one special character
        if not re.search(r'[A-Z]', password):
            return False
        if not re.search(r'[a-z]', password):
            return False
        if not re.search(r'\d', password):
            return False
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            return False
        return True

    async def create_user(self, user: UserCreate):
        if not self.is_password_strong(user.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is not strong enough. It must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character."
            )
        hashed_password = await self.get_password_hash(user.password)
        db_user = User(email=user.email, hashed_password=hashed_password)
        result = await users_collection.insert_one(db_user.dict())
        db_user.id = str(result.inserted_id)
        return db_user