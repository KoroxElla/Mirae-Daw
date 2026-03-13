from transformers import pipeline

# -------------------------------------------------
# LOAD MODEL ONCE
# -------------------------------------------------

emotion_classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None
)

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
    """
    Takes raw journal text.
    Returns emotion weights dictionary for avatar animation.
    """

    results = emotion_classifier(text)[0]

    weights = {}
    for r in results:
        weights[r["label"]] = r["score"]

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
