import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
from services.crypto_service import encrypt_text
from services.emotion_category import get_category
import os
import json

# DIRECT FILE LOAD - Skip environment variable
config_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'firebase_key.json')

try:
    with open(config_path, 'r') as f:
        cred_dict = json.load(f)
    
    # Ensure private key has proper newlines
    if 'private_key' in cred_dict:
        cred_dict['private_key'] = cred_dict['private_key'].replace('\\n', '\n')
    
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred)
    print("✅ Firebase initialized with config file")
    
except Exception as e:
    print(f"❌ Error loading Firebase config: {e}")
    raise

db = firestore.client()

#Implementing Users

def create_user(user_id, email, password_hash=None, display_name="", role="user"):
    user_data = {
        "email": email,
        "displayName": display_name,
        "createdAt": datetime.utcnow(),
        "role": role,

        "settings": {
            "notifications": True,
            "textToSpeech": False,
            "highContrast": False,
            "largeText": False,
            "privacyLevel": "private"
        },

        "preferences": {
            "journalRemindersEnabled": False,
            "reminderTime": "",
            "preferredPrompts": [],
            "comfortLevel": "medium"
        }
    }

    if password_hash:
        user_data["passwordHash"] = password_hash

    db.collection("users").document(user_id).set(user_data)

def create_user_with_role(user_id, email, password_hash=None, display_name="", role="user"):
    user_data = {
        "email": email,
        "displayName": display_name,
        "createdAt": datetime.utcnow(),
        "role": role,
        "settings": {
            "notifications": True,
            "textToSpeech": False,
            "highContrast": False,
            "largeText": False,
            "privacyLevel": "private"
        },
        "preferences": {
            "journalRemindersEnabled": False,
            "reminderTime": "",
            "preferredPrompts": [],
            "comfortLevel": "medium"
        }
    }

    if password_hash:
        user_data["passwordHash"] = password_hash

    db.collection("users").document(user_id).set(user_data)


# Adding default roles to existing users
def migrate_existing_users_to_default_role():
    """Run this once to add 'user' role to all existing users without a role"""
    users_ref = db.collection("users")
    users = users_ref.stream()
    
    updated_count = 0
    for user in users:
        user_data = user.to_dict()
        if "role" not in user_data:
            users_ref.document(user.id).update({
                "role": "user"
            })
            updated_count += 1
    
    print(f"✅ Updated {updated_count} existing users with default 'user' role")
    return updated_count

#Retrieving user role
def get_user_role(user_id):
    """Get user's role"""
    doc = db.collection("users").document(user_id).get()
    if doc.exists:
        return doc.to_dict().get("role", "user")
    return "user"


# Updating user role
def update_user_role(user_id, new_role):
    """Update user's role (admin only)"""
    db.collection("users").document(user_id).update({
        "role": new_role,
        "updatedAt": datetime.utcnow()
    })


#Implementing the Journal entry
def save_entry(user_id, text, weights, arbitration):

    encrypted_text = encrypt_text(text)
    primary_emotion = arbitration["emotions"]
    category = get_category(primary_emotion)

    db.collection("users")\
        .document(user_id)\
        .collection("entries")\
        .add({
        "text": encrypted_text,
        "createdAt": datetime.utcnow(),

        "weights": weights,
        "arbitration": arbitration,
        "primaryEmotion": primary_emotion,
        "emotionScore": weights.get(primary_emotion, 0),
        "emotionCategory": category

    })


#The Avatar entity
def update_avatar_state(user_id, arbitration, weights):

    db.collection("users")\
      .document(user_id)\
      .collection("avatar_state")\
      .document("current")\
      .set({
          "currentEmotion": arbitration["emotions"],
          "animation": arbitration["animations"],
          "mode": arbitration["mode"],
          "weights": weights,
          "lastUpdated": datetime.utcnow()
      })

#The insight entity
def get_latest_insight(user_id):

    docs = db.collection("users")\
        .document(user_id)\
        .collection("insights")\
        .order_by("generatedAt", direction=firestore.Query.DESCENDING)\
        .limit(1)\
        .stream()

    for doc in docs:
        return doc.to_dict()

    return None

#Saving Avatar details
def save_avatar(user_id, avatar_url):
    print("🔥 /avatar/save called")
    print("User ID:", user_id)
    db.collection("users")\
      .document(user_id)\
      .collection("avatar")\
      .document("current")\
      .set({
          "avatarUrl": avatar_url,
          "updatedAt": datetime.utcnow()
      })
# Getting the avatar state
def get_avatar_state(user_id):
    doc = db.collection("users")\
        .document(user_id)\
        .collection("avatar_state")\
        .document("current")\
        .get()

    if doc.exists:
        return doc.to_dict()

    return None


# Fetch avatar
def get_avatar(user_id):
    doc = db.collection("users")\
        .document(user_id)\
        .collection("avatar")\
        .document("current")\
        .get()

    if doc.exists:
        return doc.to_dict()
    return None

# Delete a journal entry based on user id and journal entry id
def delete_entry(user_id, entry_id):
    db.collection("users")\
      .document(user_id)\
      .collection("entries")\
      .document(entry_id)\
      .delete()

# Getting the latest journal entry based on timestamp
def get_latest_entry(user_id):
    docs = db.collection("users")\
        .document(user_id)\
        .collection("entries")\
        .order_by("createdAt", direction=firestore.Query.DESCENDING)\
        .limit(1)\
        .stream()

    for doc in docs:
        return doc.to_dict()

    return None
# Saving the journal settings
def save_journal_settings(user_id, title, cover):
    db.collection("users")\
      .document(user_id)\
      .collection("journal")\
      .document("settings")\
      .set({
          "title": title,
          "cover": cover,
          "updatedAt": datetime.utcnow()
      })

#Retrieving the journal settings
def get_journal_settings(user_id):
    doc = db.collection("users")\
        .document(user_id)\
        .collection("journal")\
        .document("settings")\
        .get()

    if doc.exists:
        return doc.to_dict()

    return {
        "title": "My Journal",
        "cover": "journalcover_1.jpeg"
    }
#Retrievig all journal entries
def get_entries(user_id):
    docs = db.collection("users")\
        .document(user_id)\
        .collection("entries")\
        .order_by("createdAt")\
        .stream()

    return [
        {**doc.to_dict(), "id": doc.id}
        for doc in docs
    ]

#Retrieving the primary emotion its weight and the date of the entry
def get_emotion_history(user_id):

    docs = db.collection("users")\
        .document(user_id)\
        .collection("entries")\
        .order_by("createdAt")\
        .stream()

    history = []

    for doc in docs:
        data = doc.to_dict()

        history.append({
            "date": data["createdAt"],
            "emotion": data["arbitration"]["emotions"][0],
            "weights": data["weights"]
        })

    return history
