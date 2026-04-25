from flask import Blueprint, request, jsonify
import logging
from services.auth_service import verify_token
from services.jwt_middleware import require_auth
from services.firebase_service import create_user, get_user_role

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST", "OPTIONS"])
def register():
    """
    Register a new user in Firestore after Firebase Auth creation
    Now supports role parameter
    """
    logger.info("🔐 /auth/register endpoint called")
    
    # Handle CORS preflight requests
    if request.method == "OPTIONS":
        logger.info("🔄 Handling CORS preflight")
        response = jsonify({"status": "ok"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Authorization, Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        return response, 200
    
    try:
        # 1. Check Authorization header
        auth_header = request.headers.get("Authorization")
        logger.debug(f"Authorization header: {auth_header}")
        
        if not auth_header:
            logger.error("❌ No Authorization header provided")
            return jsonify({
                "error": "Authentication required",
                "message": "No Authorization header found"
            }), 401
            
        # 2. Extract token
        if not auth_header.startswith("Bearer "):
            logger.error(f"❌ Invalid Authorization format: {auth_header[:30]}...")
            return jsonify({
                "error": "Invalid token format",
                "message": "Token must be in format: Bearer <token>"
            }), 401
            
        token = auth_header[7:]  # Remove "Bearer " prefix
        logger.debug(f"Token extracted, length: {len(token)}")
        
        # 3. Verify Firebase token
        try:
            decoded = verify_token(token)
            logger.info(f"✅ Token verified for UID: {decoded.get('uid')}")
        except Exception as auth_error:
            logger.error(f"❌ Token verification failed: {str(auth_error)}")
            return jsonify({
                "error": "Invalid token",
                "message": str(auth_error)
            }), 401
        
        uid = decoded.get("uid")
        email = decoded.get("email")
        
        if not uid:
            logger.error("❌ No UID in decoded token")
            return jsonify({
                "error": "Invalid token",
                "message": "Token does not contain user ID"
            }), 401
        
        # 4. Get role from request body (default to "user")
        role = "user"  # Default role
        display_name = ""
        
        if request.is_json:
            data = request.get_json() or {}
            role = data.get("role")
            display_name = data.get("displayName", "")
            
            # Validate role
            if role not in ["user", "agent"]:
                logger.warning(f"Invalid role '{role}', defaulting to 'user'")
                role = None
        
        logger.info(f"📝 Creating user with role: {role}, displayName: {display_name}")
        
        # 5. Create user in Firestore with role
        try:
            logger.info(f"📝 Creating Firestore user: {uid} ({email}) with role {role}")
            create_user(
                user_id=uid, 
                email=email, 
                password_hash=None,  # Firebase handles auth
                display_name=display_name, 
                role=role if role else "user"
            )
            logger.info(f"✅ User {uid} created in Firestore with role {role}")
            
        except Exception as firestore_error:
            logger.error(f"❌ Firestore creation failed: {str(firestore_error)}")
            
            # Check if user already exists
            error_str = str(firestore_error).lower()
            if "already exists" in error_str or "document already exists" in error_str:
                # Get existing user's role
                existing_role = get_user_role(uid)
                logger.info(f"📋 User already exists with role: {existing_role}")
                
                
                return jsonify({
                    "status": "already_exists",
                    "uid": uid,
                    "email": email,
                    "role": existing_role,
                    "message": f"User already registered in Firestore as {existing_role}"
                }), 200
            else:
                return jsonify({
                    "error": "Firestore error",
                    "message": str(firestore_error)
                }), 500
        
        # 6. Return success with role info
        response_data = {
            "status": "created",
            "uid": uid,
            "email": email,
            "role": role,
            "message": f"User registered successfully as {role}"
        }
        
        logger.info(f"🎉 Registration successful for {email} as {role}")
        return jsonify(response_data), 201
        
    except Exception as e:
        logger.error(f"💥 Unexpected error in /auth/register: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal server error",
            "message": "An unexpected error occurred"
        }), 500


@auth_bp.route("/auth/role", methods=["GET", "OPTIONS"])
@require_auth
def get_user_role_endpoint(user_id):
    if request.method == "OPTIONS":
        response = jsonify({"status": "ok"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Authorization, Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "GET, OPTIONS")
        return response, 200
        
    user_id = require_auth(lambda uid: uid)()
    """Get the role of the authenticated user"""
    role = get_user_role(user_id)
    return jsonify({
        "role": role,
        "userId": user_id
    }), 200


@auth_bp.route("/user/role", methods=["GET"])
def get_role():
    """Get current user's role"""
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authentication required"}), 401
        
        token = auth_header[7:]
        decoded = verify_token(token)
        uid = decoded.get("uid")
        
        role = get_user_role(uid)
        
        return jsonify({
            "uid": uid,
            "role": role
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting user role: {str(e)}")
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "authentication",
        "timestamp": datetime.utcnow().isoformat() if 'datetime' in dir() else "now",
        "endpoints": {
            "register": "/auth/register [POST]",
            "user/role": "/auth/user/role [GET]",
            "health": "/health [GET]"
        }
    }), 200


@auth_bp.route("/", methods=["GET"])
def index():
    """Root endpoint"""
    return jsonify({
        "name": "Mirae Backend API",
        "version": "1.0.0",
        "description": "Emotional journaling and avatar platform",
        "endpoints": {
            "auth": {
                "register": "/auth/register",
                "user/role": "/auth/user/role",
                "health": "/health"
            }
        }
    })
