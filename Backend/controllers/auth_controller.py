from pydantic import BaseModel
from utils.security import create_access_token, timedelta, ACCESS_TOKEN_EXPIRE_MINUTES, verify_password, get_password_hash
from fastapi import HTTPException

# Database simulation for the single admin
ADMIN_USER = "admin"
ADMIN_PASSWORD_PLAIN = "admin123"

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

def login_admin(req: LoginRequest):
    # To demonstrate bcrypt hashing validation as requested
    hashed_db_password = get_password_hash(ADMIN_PASSWORD_PLAIN)
    
    if req.username == ADMIN_USER and verify_password(req.password, hashed_db_password):
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": req.username}, expires_delta=access_token_expires
        )
        return TokenResponse(access_token=access_token, token_type="bearer")
    
    raise HTTPException(status_code=401, detail="Incorrect username or password")
