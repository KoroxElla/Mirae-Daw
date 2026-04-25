from flask import Blueprint, request, jsonify
from services.agent_service import (
    create_agent_token, get_agent_tokens, revoke_agent_token, validate_agent_token,
    get_all_users, get_user_by_id, get_user_emotion_history, get_user_journals,
    get_user_chat_sessions, get_chat_messages, export_user_data
)
from services.jwt_middleware import require_auth, require_agent_role
from services.firebase_service import get_user_role
from datetime import datetime
import json
from services.firebase_service import db

agent_bp = Blueprint("agent", __name__, url_prefix="/agent")

# Token Management (for regular users to generate agent tokens)
@agent_bp.route("/tokens", methods=["GET"])
@require_auth
def get_tokens(user_id):
    docs = db.collection("agent_tokens")\
        .where("createdBy", "==", user_id)\
        .stream()

    tokens = []

    for doc in docs:
        data = doc.to_dict()

        tokens.append({
            "id": doc.id,
            "token": data.get("token"),
            "expiresAt": data.get("expiresAt"),
            "createdAt": data.get("createdAt"),
            "scopes": data.get("scopes", []),
            "isActive": data.get("isActive", True)
        })

    return jsonify(tokens), 200

@agent_bp.route("/tokens", methods=["POST"])
@require_auth
def create_token(user_id):
    """Create a new agent token"""
    data = request.json
    expiry_days = data.get("expiryDays", 30)
    scopes = data.get("scopes", ["emotions", "journal_entries"])
    
    token = create_agent_token(user_id, expiry_days, scopes)
    
    return jsonify({
        "token": token,
        "message": "Token created successfully"
    }), 201

@agent_bp.route("/tokens/<token_id>", methods=["DELETE"])
@require_auth
def revoke_token(user_id, token_id):
    """Revoke an agent token"""
    revoke_agent_token(token_id)
    return jsonify({"message": "Token revoked"}), 200

# Agent Dashboard Endpoints (require agent role and valid token)
@agent_bp.route("/users", methods=["GET"])
@require_agent_role
def get_users(agent_id):
    """Get all users (agent dashboard)"""
    users = get_all_users(agent_id)
    return jsonify(users), 200

@agent_bp.route("/users/<user_id>", methods=["GET"])
@require_agent_role
def get_user(agent_id, user_id):
    """Get specific user details"""
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user), 200

@agent_bp.route("/users/<user_id>/emotions", methods=["GET"])
@require_agent_role
def get_user_emotions(agent_id, user_id):
    """Get emotion history for a user"""
    days = request.args.get("days", 30, type=int)
    range_param = request.args.get("range", "month")
    
    # Map range to days
    range_map = {
        "week": 7,
        "month": 30,
        "3months": 90,
        "6months": 180,
        "year": 365
    }
    days = range_map.get(range_param, days)
    
    emotion_data, emotion_totals = get_user_emotion_history(user_id, days)
    
    return jsonify({
        "data": emotion_data,
        "totals": emotion_totals,
        "range": range_param,
        "days": days
    }), 200

@agent_bp.route("/users/<user_id>/journals", methods=["GET"])
@require_agent_role
def get_user_journals_endpoint(agent_id, user_id):
    """Get user's journal entries"""
    limit = request.args.get("limit", 50, type=int)
    decrypt = request.args.get("decrypt", "false").lower() == "true"
    
    journals = get_user_journals(user_id, limit, decrypt)
    return jsonify(journals), 200

@agent_bp.route("/users/<user_id>/chats", methods=["GET"])
@require_agent_role
def get_user_chats(agent_id, user_id):
    """Get user's chat sessions"""
    limit = request.args.get("limit", 50, type=int)
    
    chats = get_user_chat_sessions(user_id, limit)
    return jsonify(chats), 200

@agent_bp.route("/users/<user_id>/chats/<chat_id>", methods=["GET"])
@require_agent_role
def get_chat_messages_endpoint(agent_id, user_id, chat_id):
    """Get messages from a specific chat"""
    messages = get_chat_messages(user_id, chat_id)
    return jsonify(messages), 200

@agent_bp.route("/users/<user_id>/export", methods=["GET"])
@require_agent_role
def export_user_data_endpoint(agent_id, user_id):
    """Export all user data"""
    export_data = export_user_data(user_id)
    
    if not export_data:
        return jsonify({"error": "User not found"}), 404
    
    # Return as JSON for download
    return jsonify(export_data), 200

# Stats endpoint for agent dashboard
@agent_bp.route("/stats", methods=["GET"])
@require_agent_role
def get_agent_stats(agent_id):
    """Get overall statistics for agent dashboard"""
    users = get_all_users(agent_id)
    
    total_users = len(users)
    total_journals = 0
    total_chats = 0
    emotion_totals = {
            "joy": 0, "sadness": 0, "anger": 0, "disgust": 0, "neutral": 0, "fear": 0, "surprise": 0
    }
    
    # Aggregate stats (limit to first 100 users for performance)
    for user in users[:100]:
        journals = get_user_journals(user["id"], limit=1000, decrypt=False)
        total_journals += len(journals)
        
        chats = get_user_chat_sessions(user["id"], limit=100)
        total_chats += len(chats)
        
        # Get emotion distribution
        _, user_emotions = get_user_emotion_history(user["id"], days=30)
        for emotion, count in user_emotions.items():
            emotion_totals[emotion] = emotion_totals.get(emotion, 0) + count
    
    return jsonify({
        "total_users": total_users,
        "total_journals": total_journals,
        "total_chats": total_chats,
        "emotion_distribution": emotion_totals,
        "active_users": len([u for u in users if u.get("createdAt")])
    }), 200

@agent_bp.route("/verify-token", methods=["POST"])
def verify_agent_token():
    data = request.json
    token = data.get("token")
    selected_user_id = data.get("userId")

    if not token or not selected_user_id:
        return jsonify({"error": "Token and userId required"}), 400

    scopes, error = validate_agent_token(token)
    if error:
        return jsonify({"error": error}), 401

    token_doc = db.collection("agent_tokens").document(token).get()
    token_data = token_doc.to_dict()

    
    if token_data.get("createdBy") != selected_user_id:
        return jsonify({"error": "Token does not belong to this user"}), 403

    user = get_user_by_id(selected_user_id)

    return jsonify({
        "userId": user["id"],
        "displayName": user["displayName"],
        "scopes": scopes
    }), 200

@agent_bp.route("/tokens/<token_id>/renew", methods=["PUT"])
@require_auth
def renew_token(user_id, token_id):
    success, result = renew_agent_token(token_id)

    if not success:
        return jsonify({"error": result}), 400

    return jsonify({
        "message": "Token renewed",
        "newExpiry": result
    }), 200

@agent_bp.route("/users/search", methods=["GET"])
@require_agent_role
def search_users(agent_id):
    query = request.args.get("q", "").lower()

    if not query:
        return jsonify([]), 200

    users_ref = db.collection("users")
    users = users_ref.where("role", "==", "user").stream()

    results = []
    for user in users:
        data = user.to_dict()
        name = data.get("displayName", "").lower()

        if query in name:
            results.append({
                "id": user.id,
                "displayName": data.get("displayName"),
                "email": data.get("email")
            })

    return jsonify(results[:10]), 200  
