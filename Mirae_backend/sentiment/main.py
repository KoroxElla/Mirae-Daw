import requests
import os


# -------------------------------------------------
# LOAD MODEL
# -------------------------------------------------


MODEL_URL = "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base"




# -------------------------------------------------
# MAP EMOTIONS → ANIMATIONS
# -------------------------------------------------

EMOTION_TO_ANIMATION = {
    "joy": "happy.fbx",
    "sadness": "sad.fbx",
    "anger": "angry.fbx",
    "fear": "scared.fbx",
    "surprise": "reacting.fbx",
    "neutral": "idle.fbx",
    "disgust": "disappointed.fbx"
}

# -------------------------------------------------
# MAIN SERVICE FUNCTION
# -------------------------------------------------

def analyze_text(text: str) -> dict:
    HF_API_KEY = os.getenv("HF_API_KEY")

    if not HF_API_KEY:
        raise ValueError("HF_API_KEY missing")

    headers = {
        "Authorization": f"Bearer {HF_API_KEY.strip()}"
    }
    """
    Takes raw journal text.
    Returns emotion weights dictionary for avatar animation.
    """

    payload = {
        "inputs": text
    }

    response = requests.post(
        MODEL_URL,
        headers=headers,
        json=payload
    )

    data = response.json()

    if isinstance(data, dict) and "error" in data:
      print("HF API error:", data["error"])

      return {
        "primary_emotion": "neutral",
        "animation": "idle.fbx",
        "weights": {"neutral": 1.0}
       }

    # Normal successful response
    result = data[0]

    weights = {
        item["label"]: item["score"]
        for item in result
    }

    # find strongest emotion
    primary_emotion = max(weights, key=weights.get)

    animation_file = EMOTION_TO_ANIMATION.get(
        primary_emotion,
        "idle.fbx"
    )

    return {
        "primary_emotion": primary_emotion,
        "animation": animation_file,
        "weights": weights
    }
