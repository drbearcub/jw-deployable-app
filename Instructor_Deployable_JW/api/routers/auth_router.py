from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from services.auth import AuthService
from models.user import User, UserCreate, Token, UserLogin
from fastapi import Request

router = APIRouter()
auth_service = AuthService()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth_service.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(request: Request, user_login: UserLogin):
    user = await auth_service.authenticate_user(user_login.email, user_login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth_service.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
async def logout():
    # Implement logout logic if needed
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(auth_service.get_current_user)):
    return current_user

@router.post("/signup", response_model=Token)
async def signup(user: UserCreate): 
    VALID_ACCESS_CODES = {"ABC123", "XYZ789", "12345"}

    if user.access_code not in VALID_ACCESS_CODES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid access code"
        )
    existing_user = await auth_service.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = await auth_service.create_user(user)
    access_token = auth_service.create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}