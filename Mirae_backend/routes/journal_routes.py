from flask import Blueprint, request, jsonify
from services.firebase_service import (save_entry, update_avatar_state, get_avatar_state, get_journal_settings, save_journal_settings, get_entries, delete_entry, get_latest_entry)
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
    }), 200

@journal_bp.route("/journal/delete/<entry_id>", methods=["DELETE"])
@require_auth
def delete_journal(user_id, entry_id):

    delete_entry(user_id, entry_id)

    latest = get_latest_entry(user_id)

    if latest:
        arbitration = latest["arbitration"]
        weights = latest["weights"]
    else:
        arbitration = {
            "mode": "single",
            "emotions": ["neutral"],
            "animations": ["idle.fbx"]
        }
        weights = {"neutral": 1.0}

    update_avatar_state(user_id, arbitration, weights)

    return jsonify({
        "mode": arbitration["mode"],
        "emotions": arbitration["emotions"]
    }), 200

@journal_bp.route("/journal/settings", methods=["GET"])
@require_auth
def fetch_settings(user_id):
    return jsonify(get_journal_settings(user_id)), 200


@journal_bp.route("/journal/settings", methods=["POST"])
@require_auth
def update_settings(user_id):
    data = request.json
    save_journal_settings(
        user_id,
        data.get("title"),
        data.get("cover")
    )
    return jsonify({"status": "saved"}), 200


@journal_bp.route("/journal/me", methods=["GET"])
@require_auth
def fetch_entries(user_id):
    return jsonify(get_entries(user_id)), 200


@journal_bp.route("/journal/decrypt", methods=["POST"])
@require_auth
def decrypt_journal_entry(user_id):
    data = request.json
    encrypted_text = data.get("encrypted")

    if not encrypted_text:
        return jsonify({"error": "No encrypted text provided"}), 400

    try:
        from services.crypto_service import decrypt_text
        decrypted = decrypt_text(encrypted_text)
        return jsonify({"decrypted": decrypted}), 200
    except Exception as e:
        return jsonify({"error": "Decryption failed"}), 500
