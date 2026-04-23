from flask import Blueprint, request, jsonify
from services.jwt_middleware import require_auth
from services.firebase_service import save_avatar as save_avatar_to_db, db
from datetime import datetime

user_bp = Blueprint("user", __name__, url_prefix="/user")

# Save avatar 
@user_bp.route("/avatar", methods=["POST"])
@require_auth
def save_avatar_route(user_id):
    data = request.json
    avatar_data = data.get("avatar")

    if not avatar_data:
        return jsonify({"error": "Missing avatar data"}), 400

    save_avatar_to_db(user_id, avatar_data)

    return jsonify({"message": "Avatar saved successfully"}), 200
    
@user_bp.route("/avatar", methods=["GET"])
@require_auth
def get_user_avatar(user_id):
    from services.firebase_service import get_avatar
    
    data = get_avatar(user_id)

    if not data:
        return jsonify({"avatarUrl": ""}), 200

    return jsonify(data), 200

# Update user
@user_bp.route("/update", methods=["POST"])
@require_auth
def update_user(user_id):
    data = request.json

    db.collection("users").document(user_id).update({
        "displayName": data.get("displayName"),
        "updatedAt": datetime.utcnow()
    })

    return jsonify({"success": True})

@user_bp.route("/settings", methods=["GET"])
@require_auth
def get_settings(user_id):
    doc = db.collection("users").document(user_id).get()
    return jsonify(doc.to_dict().get("settings", {}))


@user_bp.route("/preferences", methods=["GET"])
@require_auth
def get_preferences(user_id):
    doc = db.collection("users").document(user_id).get()
    return jsonify(doc.to_dict().get("preferences", {}))