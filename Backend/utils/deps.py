from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from utils.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    username: str = payload.get("sub")
    if username is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return username

def get_current_user_data(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    username: str = payload.get("sub")
    role: str = payload.get("role", "admin")  # Default to admin for legacy
    if username is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"username": username, "role": role}

def require_role(required_role: str):
    def dependency(user_data: dict = Depends(get_current_user_data)):
        if user_data["role"] != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role}."
            )
        return user_data["username"]
    return dependency
