from fastapi import APIRouter, Depends
from controllers.auth_controller import login_admin, LoginRequest, TokenResponse
from utils.deps import get_current_user_data

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):
    return login_admin(req)

@router.post("/logout")
def logout():
    # Since we are using JWT, logout is usually handled client-side by deleting the token.
    # A backend logout endpoint is good for clearing cookies or returning a success message.
    return {"message": "Successfully logged out"}

@router.get("/me")
def get_me(current_user_data: dict = Depends(get_current_user_data)):
    return current_user_data
