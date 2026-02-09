from flask import Blueprint, request, jsonify
from services.sentiment_service import analyze_text
from services.animation_service import build_animation
from services.firebase_service import save_entry
from services.auth_service import verify_token
from services.crypto_service import encrypt_text, decrypt_text

emotion_bp = Blueprint("emotion", __name__)


@emotion_bp.route("/emotion", methods=["POST"])

def emotion():
    auth_header= request.headers.get("Authorization")
    token = auth_header.split("Bearer ")[1]

    user_id = verify_token(token)

    #Incoming journal entry
    plain_text = request.json.get("text", "")

    #Encrypt entry before storing
    encrypted_text = encrypt_text(plain_text)

    #Decrypt only for sentiment analysis
    decrypted_text = decrypt_text(encrypted_text)

    weights = analyze_text(decrypted_text)

    instructions = build_animation(weights)
    save_entry(user_id, encrypted_text, weights, instructions)

    return jsonify(instructions)
