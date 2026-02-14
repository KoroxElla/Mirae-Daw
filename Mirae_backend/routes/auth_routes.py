from flask import Blueprint, request, jsonify
import logging
from services.auth_service import verify_token
from services.firebase_service import create_user

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST", "OPTIONS"])
def register():
    """
    Register a new user in Firestore after Firebase Auth creation
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
        
        # 4. Create user in Firestore
        try:
            logger.info(f"📝 Creating Firestore user: {uid} ({email})")
            
            # Get optional display name from request body if provided
            display_name = ""
            if request.is_json:
                data = request.get_json() or {}
                display_name = data.get("display_name", "")
            
            create_user(uid, email, display_name)
            logger.info(f"✅ User {uid} created in Firestore")
            
        except Exception as firestore_error:
            logger.error(f"❌ Firestore creation failed: {str(firestore_error)}")
            
            # Check if user already exists
            if "already exists" in str(firestore_error).lower():
                return jsonify({
                    "status": "already_exists",
                    "uid": uid,
                    "email": email,
                    "message": "User already registered in Firestore"
                }), 200
            else:
                return jsonify({
                    "error": "Firestore error",
                    "message": str(firestore_error)
                }), 500
        
        # 5. Return success
        response_data = {
            "status": "created",
            "uid": uid,
            "email": email,
            "message": "User registered successfully"
        }
        
        logger.info(f"🎉 Registration successful for {email}")
        return jsonify(response_data), 201
        
    except Exception as e:
        logger.error(f"💥 Unexpected error in /auth/register: {str(e)}", exc_info=True)
        return jsonify({
            "error": "Internal server error",
            "message": "An unexpected error occurred"
        }), 500

# ==================== ADD THESE NEW ENDPOINTS ====================

@auth_bp.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "authentication",
        "timestamp": "now",  # You can import datetime and use datetime.utcnow().isoformat()
        "endpoints": {
            "register": "/auth/register [POST]",
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
                "health": "/health"
            }
        }
    })
