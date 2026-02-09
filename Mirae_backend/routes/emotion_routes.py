from flask import Blueprint, request, jsonify
from services.sentiment_service import analyze_text
from services.animation_service import build_animation
from services.firebase_service import save_entry, update_avatar_state


emotion_bp = Blueprint("emotion", __name__)


@emotion_bp.route("/emotion", methods=["POST"])

def emotion():
    body = request.json

    text = request.json.get("text", "")
    user_id = body.get("userId", "demoUser")

    weights = analyze_text(text)

    instructions = build_animation(weights)
    save_entry(text, weights, instructions)

    primary = max(weights, key = weights.get)
    update_avatar_state(user_id, primary, instructions)

    return jsonify(instructions)
