from functools import wraps
from flask import request, jsonify
from services.auth_service import verify_token
import firebase_admin
from firebase_admin import auth
from services.firebase_service import get_user_role
from services.agent_service import validate_agent_token


def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authentication required"}), 401

        token = auth_header.split(" ")[1]

        scopes, error = validate_agent_token(token)
        if scopes is not None:
            
            request.agent_scopes = scopes
            request.is_agent = True
            return f(None, *args, **kwargs)

        try:
            decoded_token = verify_token(token)
            user_id = decoded_token["uid"]   # Firebase UID
            request.is_agent = False
            request.agent_scopes = []
        except Exception as e:
            return jsonify({
                "error": "Invalid token",
                "message": str(e)
            }), 401

        return f(user_id, *args, **kwargs)

    return decorated_function

def require_agent_role(f):
    """Decorator that requires agent role (either Firebase agent user or valid agent token)"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authentication required"}), 401

        token = auth_header.split(" ")[1]

        # Check if it's an agent token first
        scopes, error = validate_agent_token(token)
        if scopes is not None:
            # Valid agent token - get the agent ID from the token
            from services.agent_service import db
            token_doc = db.collection("agent_tokens").document(token).get()
            if token_doc.exists:
                agent_id = token_doc.to_dict().get("createdBy")
                request.agent_scopes = scopes
                request.is_agent = True
                return f(agent_id, *args, **kwargs)
            else:
                return jsonify({"error": "Invalid agent token"}), 401

        # If not an agent token, verify as Firebase token and check role
        try:
            decoded_token = verify_token(token)
            user_id = decoded_token["uid"]

            # Check user's role from Firestore
            user_role = get_user_role(user_id)

            if user_role != "agent":
                return jsonify({
                    "error": "Agent role required",
                    "message": "This endpoint is only accessible to agents"
                }), 403

            request.is_agent = True
            request.agent_scopes = ["all"]  # Full access for agent users
            return f(user_id, *args, **kwargs)

        except Exception as e:
            return jsonify({
                "error": "Invalid token",
                "message": str(e)
            }), 401

    return decorated_function


def require_scope(required_scope):
    """Decorator to check if agent token has required scope"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check if we have agent scopes from the request
            if not hasattr(request, 'agent_scopes') or not request.agent_scopes:
                return jsonify({
                    "error": "Agent token required with appropriate scopes",
                    "required_scope": required_scope
                }), 403

            # 'all' scope has access to everything
            if 'all' in request.agent_scopes or required_scope in request.agent_scopes:
                return f(*args, **kwargs)

            return jsonify({
                "error": f"Required scope '{required_scope}' not present",
                "available_scopes": request.agent_scopes
            }), 403

        return decorated_function
    return decorator


def optional_auth(f):
    """Decorator that allows both authenticated and unauthenticated requests"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        user_id = None
        is_agent = False
        agent_scopes = []

        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

            # Try agent token first
            scopes, error = validate_agent_token(token)
            if scopes is not None:
                is_agent = True
                agent_scopes = scopes
                from services.agent_service import db
                token_doc = db.collection("agent_tokens").document(token).get()
                if token_doc.exists:
                    user_id = token_doc.to_dict().get("createdBy")
            else:
                # Try Firebase token
                try:
                    decoded_token = verify_token(token)
                    user_id = decoded_token["uid"]
                except Exception:
                    pass  # Invalid token, proceed as unauthenticated

        request.user_id = user_id
        request.is_agent = is_agent
        request.agent_scopes = agent_scopes

        return f(*args, **kwargs)

    return decorated_function
