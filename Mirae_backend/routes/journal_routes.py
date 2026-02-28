from flask import Blueprint, request, jsonify
from services.firebase_service import (save_entry, update_avatar_state, get_avatar_state)
from services.animation_service import (arbitrate_emotion, apply_emotional_decay)
from sentiment.main import analyze_text
from services.jwt_middleware import require_auth

journal_bp = Blueprint("journal", __name__)

@journal_bp.route("/journal/save", methods=["POST"])
@require_auth
def save_journal(user_id):

    data = request.json
    text = data.get("text")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    # 🔥 Analyze text
    analysis = analyze_text(text)

    new_weights = analysis["weights"]
    previous_state = get_avatar_state(user_id)
    previous_weights = previous_state.get("weights") if previous_state else None

    final_weights = apply_emotional_decay(new_weights, previous_weights)
    arbitration = arbitrate_emotion(final_weights)

    mode = arbitration["mode"]
    emotions = arbitration["emotions"]
    animations = arbitration["animations"]

    # Save entry
    save_entry(user_id, text, final_weights, arbitration)

    # Update avatar state
    update_avatar_state(user_id, arbitration, final_weights)

    return jsonify({
        "mode": mode,
        "emotions" : emotions,
        "animations": animations
    }), 200

@journal_bp.route("/journal/delete/<entry_id>", methods=["DELETE"])
@require_auth
def delete_journal(user_id, entry_id):

    delete_entry(user_id, entry_id)

    latest = get_latest_entry(user_id)

    if latest:
        emotion = get_dominant_emotion(latest["emotions"])
        animation = latest["animation"]
    else:
        emotion = "neutral"
        animation = "idle.fbx"

    update_avatar_state(user_id, emotion, animation)

    return jsonify({
        "emotion": emotion,
        "animation": animation
    }), 200
