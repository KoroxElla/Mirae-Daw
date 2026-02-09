from flask import Blueprint, request, jsonify
from services.auth_service import verify_token
from services.firebase_service import create_user

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/auth/register", methods=["POST"])
def register():

    token = request.headers.get("Authorization").split("Bearer ")[1]

    decoded = verify_token(token)

    uid = decoded["uid"]
    email = decoded["email"]

    create_user(uid, email)

    return jsonify({"status": "created"})

