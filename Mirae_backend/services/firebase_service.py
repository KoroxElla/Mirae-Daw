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
def save_entry(user_id, text, weights, arbitration):

    encrypted_text = encrypt_text(text)

    db.collection("users")\
        .document(user_id)\
        .collection("entries")\
        .add({
        "text": encrypted_text,
        "createdAt": datetime.utcnow(),

        "weights": weights,
        "arbitration": arbitration,

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
def save_insight(user_id, data):
    db.collection("users")\
      .document(user_id)\
      .collection("insights")\
      .add(data)

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
