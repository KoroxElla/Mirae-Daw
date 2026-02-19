from flask import Blueprint, request, jsonify
from services.firebase_service import save_avatar

user_bp = Blueprint("user", __name__, url_prefix="/user")

# Save avatar
@user_bp.route("/avatar", methods=["POST"])
def save_avatar():

    data = request.json
    user_id = data.get("userId")
    avatar_data = data.get("avatar")

    if not user_id or not avatar_data:
        return jsonify({"error": "Missing userId or avatar data"}), 400

    save_user_avatar(user_id, avatar_data)

    return jsonify({"message": "Avatar saved successfully"}), 200

