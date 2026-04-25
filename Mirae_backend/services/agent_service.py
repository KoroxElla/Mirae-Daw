from firebase_admin import firestore
from datetime import datetime, timedelta
import secrets
import string
from services.crypto_service import decrypt_text
from services.emotion_category import get_category

db = firestore.client()

# Token Management
def create_agent_token(user_id, expiry_days=30, scopes=None):
    """Create a new API token for agent access"""
    if scopes is None:
        scopes = ['emotions', 'journal_entries']
    
    # Generate a secure token (36 characters)
    token = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(36))
    
    token_data = {
        "token": token,
        "createdBy": user_id,
        "createdAt": datetime.utcnow(),
        "expiresAt": datetime.utcnow() + timedelta(days=expiry_days),
        "scopes": scopes,
        "isActive": True,
        "lastUsed": None
    }
    
    db.collection("agent_tokens").document(token).set(token_data)
    return token

def get_agent_tokens(user_id):
    """Get all tokens created by a user"""
    tokens_ref = db.collection("agent_tokens")
    tokens = tokens_ref.where("createdBy", "==", user_id).stream()
    
    result = []
    for token_doc in tokens:
        data = token_doc.to_dict()
        result.append({
            "id": token_doc.id,
            "token": data.get("token"),
            "expiresAt": data.get("expiresAt"),
            "scopes": data.get("scopes", []),
            "createdAt": data.get("createdAt"),
            "isActive": data.get("isActive", True)
        })
    
    return result

def revoke_agent_token(token_id):
    """Revoke an agent token"""
    db.collection("agent_tokens").document(token_id).update({
        "isActive": False,
        "revokedAt": datetime.utcnow()
    })

def validate_agent_token(token):
    """Validate an agent token and return its scopes"""
    token_doc = db.collection("agent_tokens").document(token).get()
    
    if not token_doc.exists:
        return None, "Token not found"
    
    data = token_doc.to_dict()
    
    if not data.get("isActive", False):
        return None, "Token is revoked"
    
    if data.get("expiresAt") < datetime.utcnow():
        return None, "Token has expired"
    
    # Update last used timestamp
    db.collection("agent_tokens").document(token).update({
        "lastUsed": datetime.utcnow()
    })
    
    return data.get("scopes", []), None

# User Management for Agents
def get_all_users(agent_id=None):
    """Get all users (for agent dashboard)"""
    users_ref = db.collection("users")
    users = users_ref.where("role", "==", "user").stream()
    
    result = []
    for user_doc in users:
        data = user_doc.to_dict()
        result.append({
            "id": user_doc.id,
            "email": data.get("email"),
            "displayName": data.get("displayName", ""),
            "createdAt": data.get("createdAt"),
            "settings": data.get("settings", {}),
            "preferences": data.get("preferences", {})
        })
    
    return result

def get_user_by_id(user_id):
    """Get a specific user by ID"""
    user_doc = db.collection("users").document(user_id).get()
    
    if not user_doc.exists:
        return None
    
    data = user_doc.to_dict()
    return {
        "id": user_doc.id,
        "email": data.get("email"),
        "displayName": data.get("displayName", ""),
        "createdAt": data.get("createdAt"),
        "role": data.get("role", "user"),
        "settings": data.get("settings", {}),
        "preferences": data.get("preferences", {})
    }

# Emotion Analytics
def get_user_emotion_history(user_id, days=30):
    """Get emotion history for a user over specified days"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    entries_ref = db.collection("users").document(user_id).collection("entries")
    entries = entries_ref.where("createdAt", ">=", cutoff_date).order_by("createdAt").stream()
    
    # Group by date
    emotion_data = {}
    emotion_totals = {
        "joy": 0, "sadness": 0, "anger": 0, "anxiety": 0, "neutral": 0
    }
    
    for entry in entries:
        data = entry.to_dict()
        date_key = data["createdAt"].strftime("%Y-%m-%d")
        primary_emotion = data.get("primaryEmotion", "neutral")
        
        if date_key not in emotion_data:
            emotion_data[date_key] = {
                "date": date_key,
                "joy": 0, "sadness": 0, "anger": 0, "anxiety": 0, "neutral": 0
            }
        
        # Map emotions to categories
        emotion_category = primary_emotion.lower()
        if emotion_category in emotion_data[date_key]:
            emotion_data[date_key][emotion_category] += 1
            emotion_totals[emotion_category] = emotion_totals.get(emotion_category, 0) + 1
    
    # Convert to list and sort by date
    result = sorted(emotion_data.values(), key=lambda x: x["date"])
    
    return result, emotion_totals

# Journal Access
def get_user_journals(user_id, limit=50, decrypt=False):
    """Get user's journal entries"""
    entries_ref = db.collection("users").document(user_id).collection("entries")
    entries = entries_ref.order_by("createdAt", direction=firestore.Query.DESCENDING).limit(limit).stream()
    
    result = []
    for entry_doc in entries:
        data = entry_doc.to_dict()
        entry_data = {
            "id": entry_doc.id,
            "createdAt": data.get("createdAt"),
            "primaryEmotion": data.get("primaryEmotion", "neutral"),
            "emotionScore": data.get("emotionScore", 0),
            "emotionCategory": data.get("emotionCategory", ""),
            "weights": data.get("weights", {}),
            "arbitration": data.get("arbitration", {})
        }
        
        # Decrypt text if requested and scope allows
        if decrypt and data.get("text"):
            try:
                entry_data["text"] = decrypt_text(data["text"])
            except:
                entry_data["text"] = "[Encrypted]"
        else:
            entry_data["text"] = "[Encrypted - Access not granted]"
        
        result.append(entry_data)
    
    return result

# Chat Access
def get_user_chat_sessions(user_id, limit=50):
    """Get user's chat sessions"""
    chats_ref = db.collection("users").document(user_id).collection("chats")
    chats = chats_ref.order_by("createdAt", direction=firestore.Query.DESCENDING).limit(limit).stream()
    
    result = []
    for chat_doc in chats:
        data = chat_doc.to_dict()
        result.append({
            "id": chat_doc.id,
            "createdAt": data.get("createdAt"),
            "updatedAt": data.get("updatedAt"),
            "messageCount": data.get("messageCount", 0),
            "preview": data.get("preview", ""),
            "linkedEntryId": data.get("linkedEntryId")
        })
    
    return result

def get_chat_messages(user_id, chat_id):
    """Get messages from a specific chat session"""
    messages_ref = db.collection("users").document(user_id).collection("chats").document(chat_id).collection("messages")
    messages = messages_ref.order_by("timestamp").stream()
    
    result = []
    for msg_doc in messages:
        data = msg_doc.to_dict()
        result.append({
            "id": msg_doc.id,
            "role": data.get("role"),
            "content": data.get("content"),
            "timestamp": data.get("timestamp")
        })
    
    return result

# Export Data
def export_user_data(user_id):
    """Export all user data for analysis"""
    user = get_user_by_id(user_id)
    if not user:
        return None
    
    # Get all data
    journals = get_user_journals(user_id, limit=1000, decrypt=True)
    emotion_history, emotion_totals = get_user_emotion_history(user_id, days=365)
    chat_sessions = get_user_chat_sessions(user_id, limit=100)
    
    # Get avatar state
    avatar_ref = db.collection("users").document(user_id).collection("avatar_state").document("current").get()
    avatar_state = avatar_ref.to_dict() if avatar_ref.exists else None
    
    return {
        "user": user,
        "statistics": {
            "total_journals": len(journals),
            "total_chat_sessions": len(chat_sessions),
            "emotion_distribution": emotion_totals,
            "active_days": len(emotion_history)
        },
        "emotion_timeline": emotion_history,
        "journals": journals,
        "chat_sessions": chat_sessions,
        "avatar_state": avatar_state,
        "exported_at": datetime.utcnow().isoformat()
    }

def renew_agent_token(token_id, extra_days=30):
    """Extend expiry of an existing token"""
    token_ref = db.collection("agent_tokens").document(token_id)
    token_doc = token_ref.get()

    if not token_doc.exists:
        return False, "Token not found"

    data = token_doc.to_dict()

    if not data.get("isActive", False):
        return False, "Token is revoked"

    # Extend expiry
    new_expiry = datetime.utcnow() + timedelta(days=extra_days)

    token_ref.update({
        "expiresAt": new_expiry,
        "renewedAt": datetime.utcnow()
    })

    return True, new_expiry
