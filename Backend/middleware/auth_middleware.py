from fastapi import Request
from fastapi.responses import JSONResponse
from utils.security import decode_access_token

async def auth_middleware(request: Request, call_next):
    # Allow CORS preflight requests
    if request.method == "OPTIONS":
        return await call_next(request)
        
    # Only protect /admin and /auth/me routes
    path = request.url.path
    if not (path.startswith("/admin") or path.startswith("/auth/me")):
        return await call_next(request)
        
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"detail": "Not authenticated"})
        
    token = auth_header.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        return JSONResponse(status_code=401, content={"detail": "Invalid or expired token"})
        
    request.state.user = payload.get("sub")
    return await call_next(request)
