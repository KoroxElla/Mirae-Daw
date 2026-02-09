from firebase_admin import auth

def verify_token(id_token):
    decoded = auth.verify_id_token(id_token)
    return decoded["uid"]

