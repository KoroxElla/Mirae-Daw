from flask import Blueprint, request, jsonify
from services.sentiment_service import analyze_text
from services.animation_service import build_animation
from services.firebase_service import save_entry


emotion_bp = Blueprint("emotion", __name__)


@emotion_bp.route("/emotion", methods=["POST"])

def emotion():
    text = request.json.get("text", "")
    weights = analyze_text(text)

    instructions = build_animation(weights)
    save_entry(text, weights, instructions)

    return jsonify(instructions)
