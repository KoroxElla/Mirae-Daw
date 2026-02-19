from functools import wraps
from flask import request, jsonify
from services.auth_service import verify_token

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401

        token = auth_header[7:]

        try:
            decoded = verify_token(token)
            request.user = decoded
        except Exception as e:
            return jsonify({"error": "Invalid token", "message": str(e)}), 401

        return f(*args, **kwargs)

    return decorated

