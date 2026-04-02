from flask import Blueprint, request, jsonify
from services.jwt_middleware import require_auth
from services.firebase_service import save_avatar, get_avatar

avatar_bp = Blueprint("avatar", __name__, url_prefix="/avatar")

# GET /avatar/me
@avatar_bp.route("/me", methods=["GET"])
@require_auth
def fetch_avatar(user_id):

    avatar = get_avatar(user_id)

    if avatar:
        return jsonify(avatar), 200

    return jsonify({ "avatarUrl": None }), 200


# POST /avatar/save
@avatar_bp.route("/save", methods=["POST"])
@require_auth
def save_avatar_route(user_id):
    data = request.get_json()

    avatar_url = data.get("avatarUrl")

    if not avatar_url:
        return jsonify({ "error": "avatarUrl required" }), 400

    save_avatar(user_id, avatar_url)

    return jsonify({ "status": "saved" }), 200

