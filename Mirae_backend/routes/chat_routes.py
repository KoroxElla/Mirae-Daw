from flask import Blueprint, request, jsonify
from services.gemini_service import get_or_create_chat_session, save_chat_session_to_db, active_sessions
from services.jwt_middleware import require_auth
from services.firebase_service import db
from datetime import datetime
import uuid

chat_bp = Blueprint("chat", __name__, url_prefix="/chat")

@chat_bp.route("/sessions", methods=["GET"])
@require_auth
def get_chat_sessions(user_id):
    """Get all chat sessions for a user"""
    try:
        sessions_ref = db.collection("users").document(user_id).collection("chats")
        sessions = sessions_ref.order_by("updated_at", direction="DESCENDING").stream()
        
        result = []
        for doc in sessions:
            data = doc.to_dict()
            result.append({
                "id": doc.id,
                "title": data.get("title", f"Chat {doc.id[-6:]}"),
                "createdAt": data.get("created_at"),
                "lastMessageAt": data.get("updated_at"),
                "linkedEntryId": data.get("linked_entry_id"),
                "messageCount": len(data.get("messages", []))
            })
        
        return jsonify(result), 200
    except Exception as e:
        print(f"Error fetching sessions: {e}")
        return jsonify([]), 200

@chat_bp.route("/sessions", methods=["POST"])
@require_auth
def create_chat_session(user_id):
    """Create a new chat session"""
    data = request.json
    linked_entry_id = data.get("linkedEntryId")
    
    session_id = str(uuid.uuid4())
    title = f"Conversation {datetime.utcnow().strftime('%b %d')}"
    
    # Create session in Firestore
    chat_ref = db.collection("users").document(user_id).collection("chats").document(session_id)
    chat_ref.set({
        "session_id": session_id,
        "user_id": user_id,
        "title": title,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "linked_entry_id": linked_entry_id,
        "messages": []
    })
    
    # Initialize Gemini session
    get_or_create_chat_session(session_id, user_id)
    
    return jsonify({
        "id": session_id,
        "title": title,
        "createdAt": datetime.utcnow(),
        "lastMessageAt": datetime.utcnow(),
        "linkedEntryId": linked_entry_id,
        "messages": []
    }), 201

@chat_bp.route("/sessions/<session_id>", methods=["GET"])
@require_auth
def get_chat_session(user_id, session_id):
    """Get a specific chat session with messages"""
    try:
        chat_ref = db.collection("users").document(user_id).collection("chats").document(session_id)
        doc = chat_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Session not found"}), 404
        
        data = doc.to_dict()
        return jsonify({
            "id": session_id,
            "title": data.get("title"),
            "messages": data.get("messages", []),
            "linkedEntryId": data.get("linked_entry_id"),
            "createdAt": data.get("created_at"),
            "lastMessageAt": data.get("updated_at")
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chat_bp.route("/message", methods=["POST"])
@require_auth
def send_message(user_id):
    """Send a message and get AI response using Gemini"""
    data = request.json
    session_id = data.get("sessionId")
    user_message = data.get("message")
    
    if not session_id or not user_message:
        return jsonify({"error": "Session ID and message required"}), 400
    
    try:
        # Get or create Gemini chat session
        gemini_session = get_or_create_chat_session(session_id, user_id)
        
        # Send message to Gemini
        reply, is_crisis, is_out_of_scope = gemini_session.send_message(user_message)
        
        # Save messages to Firestore
        chat_ref = db.collection("users").document(user_id).collection("chats").document(session_id)
        doc = chat_ref.get()
        
        if doc.exists:
            data = doc.to_dict()
            messages = data.get("messages", [])
        else:
            messages = []
        
        # Add user message
        messages.append({
            "id": str(uuid.uuid4()),
            "role": "user",
            "content": user_message,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Add assistant message
        assistant_message_id = str(uuid.uuid4())
        messages.append({
            "id": assistant_message_id,
            "role": "assistant",
            "content": reply,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Update Firestore
        chat_ref.set({
            "session_id": session_id,
            "user_id": user_id,
            "messages": messages,
            "updated_at": datetime.utcnow(),
            "title": data.get("title", f"Chat {session_id[-6:]}")
        }, merge=True)
        
        return jsonify({
            "id": assistant_message_id,
            "reply": reply,
            "isCrisis": is_crisis,
            "isOutOfScope": is_out_of_scope
        }), 200
        
    except Exception as e:
        print(f"Error in chat message: {e}")
        return jsonify({
            "reply": "I'm here to listen. Can you tell me more about what's on your mind?",
            "isCrisis": False,
            "isOutOfScope": False
        }), 200

@chat_bp.route("/sessions/<session_id>/history", methods=["GET"])
@require_auth
def get_chat_history(user_id, session_id):
    """Get chat history for context analysis"""
    try:
        chat_ref = db.collection("users").document(user_id).collection("chats").document(session_id)
        doc = chat_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Session not found"}), 404
        
        data = doc.to_dict()
        messages = data.get("messages", [])
        
        # Analyze recent messages for patterns
        recent_messages = messages[-10:] if len(messages) > 10 else messages
        crisis_detected = any(
            "crisis" in msg.get("content", "").lower() or 
            "suicide" in msg.get("content", "").lower() or
            "hurt" in msg.get("content", "").lower()
            for msg in recent_messages if msg.get("role") == "user"
        )
        
        return jsonify({
            "messages": recent_messages,
            "crisisDetected": crisis_detected,
            "messageCount": len(messages)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
