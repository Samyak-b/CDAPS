import sys
import traceback

if __name__ == "__main__":
    try:
        from controllers.auth_controller import login_admin, LoginRequest
        req = LoginRequest(username="admin", password="admin123")
        res = login_admin(req)
        print("SUCCESS:", res)
    except Exception as e:
        traceback.print_exc()
