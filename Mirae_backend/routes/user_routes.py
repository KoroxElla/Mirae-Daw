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
    
# Get user avatar
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


# Get user profile
@user_bp.route("/profile", methods=["GET"])
@require_auth
def get_profile(user_id):
    user = get_user_by_id(user_id)

    journals_ref = db.collection("users").document(user_id).collection("journals")
    chats_ref = db.collection("users").document(user_id).collection("chats")

    journal_count = len(list(journals_ref.stream()))
    chat_count = len(list(chats_ref.stream()))

    return jsonify({
        "id": user["id"],
        "email": user["email"],
        "displayName": user.get("displayName"),
        "role": user.get("role"),
        "createdAt": user.get("createdAt"),
        "journalCount": journal_count,
        "chatCount": chat_count
    }), 200

# Get user settings
@user_bp.route("/settings", methods=["GET"])
@require_auth
def get_settings(user_id):
    doc = db.collection("users").document(user_id).collection("meta").document("settings").get()

    if doc.exists:
        return jsonify(doc.to_dict()), 200

    return jsonify({
        "notifications": True,
        "textToSpeech": False,
        "highContrast": False,
        "largeText": False,
        "privacyLevel": "private"
    }), 200

# Update user settings
@user_bp.route("/settings", methods=["PUT"])
@require_auth
def update_settings(user_id):
    data = request.json

    db.collection("users").document(user_id)\
        .collection("meta").document("settings")\
        .set(data, merge=True)

    return jsonify({"success": True}), 200

# Get user preferences
@user_bp.route("/preferences", methods=["GET"])
@require_auth
def get_preferences(user_id):
    doc = db.collection("users").document(user_id).collection("meta").document("preferences").get()

    if doc.exists:
        return jsonify(doc.to_dict()), 200

    return jsonify({
        "journalRemindersEnabled": False,
        "reminderTime": "09:00",
        "preferredPrompts": [],
        "comfortLevel": "medium"
    }), 200

# Update user preferences
@user_bp.route("/preferences", methods=["PUT"])
@require_auth
def update_preferences(user_id):
    data = request.json

    db.collection("users").document(user_id)\
        .collection("meta").document("preferences")\
        .set(data, merge=True)

    return jsonify({"success": True}), 200