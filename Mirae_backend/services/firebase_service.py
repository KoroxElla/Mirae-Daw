import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

cred = credentials.Certificate("config/firebase_key.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

#Implementing Users

def create_user(user_id, email, display_name=""):
    db.collection("users").document(user_id).set({
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
    })

#Implementing the Journal entry
def save_entry(user_id, text, weights, instructions):

    entry_ref = (
        db.collection("users")
        .document(user_id)
        .collection("entries")
        .document()
    )

    entry_ref.set({
        "text": text,
        "createdAt": datetime.utcnow(),

        "emotions": weights,
        "animation": instructions,

        "primaryEmotion": max(weights, key=weights.get),
        "hasCrisisKeywords": False
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

