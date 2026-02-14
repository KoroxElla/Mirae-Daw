import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
from services.crypto_service import encrypt_text

cred = credentials.Certificate("config/firebase_key.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

#Implementing Users

def create_user(user_id, email, password_hash=None, display_name=""):
    user_data = {
        "email": email,
        "displayName": display_name,
        "createdAt": datetime.utcnow(),

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

#Implementing the Journal entry
def save_entry(user_id, text, weights, instructions):

    encrypted_text = encrypt_text(text)

    db.collection("users")\
        .document(user_id)\
        .collection("entries")\
        .add({
        "text": encrypted_text,
        "createdAt": datetime.utcnow(),

        "emotions": weights,
        "animation": instructions,

    })


#The Avatar entity
def update_avatar_state(user_id, emotion, instructions):

    db.collection("users")\
      .document(user_id)\
      .collection("avatar_state")\
      .document("current")\
      .set({
          "currentEmotion": emotion,
          "animation": instructions,
          "lastUpdated": datetime.utcnow()
      })

#The insight entity
def save_insight(user_id, data):
    db.collection("users")\
      .document(user_id)\
      .collection("insights")\
      .add(data)

