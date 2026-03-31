EMOTION_CLASSES = {
<<<<<<< HEAD
    "positive": {"joy",  "surprise"},
    "negative": {"anger", "sadness", "fear", "disgust"},
=======
    "positive": {"joy", "trust", "anticipation", "positive", "surprise"},
    "negative": {"anger", "sadness", "fear", "disgust", "negative"},
>>>>>>> 36a9f3824f595c788305ef6b99b71a1198038ec3
    "neutral": {"neutral"}
}


EMOTION_TO_ANIMATION = {
    "joy": "happy.fbx",
<<<<<<< HEAD
    "surprise": "reacting.fbx",
    "anger": "angry.fbx",
    "sadness": "sad.fbx",
    "fear": "scared.fbx",
    "disgust": "disappointed.fbx",
    "neutral": "idle.fbx"
}

DECAY_FACTOR = 0.6

def arbitrate_emotion(weights: dict):
    """
    Full emotional arbitration logic.
    Returns:
        {
            "mode": "single" | "loop",
            "emotions": [list],
            "animations": [list]
        }
    """

    if not weights:
        return {
            "mode": "single",
            "emotions": ["neutral"],
            "animations": ["idle.fbx"]
        }

    # -------------------------
    # STEP 1 — Determine dominant class
    # -------------------------

=======
    "trust": "trust.fbx",
    "anticipation": "excited.fbx",
    "positive": "celebrating.fbx",
    "surprise": "reacting.fbx",

    "anger": "angry.fbx",
    "sadness": "sad.fbx",
    "fear": "scared.fbx",
    "disgust": "disappointed.fbx",
    "negative": "depressed.fbx",

    "neutral": "idle.fbx"
}

DECAY_FACTOR = 0.6

def arbitrate_emotion(weights: dict):
    """
    Full emotional arbitration logic.
    Returns:
        {
            "mode": "single" | "loop",
            "emotions": [list],
            "animations": [list]
        }
    """

    if not weights:
        return {
            "mode": "single",
            "emotions": ["neutral"],
            "animations": ["idle.fbx"]
        }

    # -------------------------
    # STEP 1 — Determine dominant class
    # -------------------------

>>>>>>> 36a9f3824f595c788305ef6b99b71a1198038ec3
    class_totals = {
        "positive": 0,
        "negative": 0,
        "neutral": 0
    }

    for emotion, weight in weights.items():
        for class_name, class_set in EMOTION_CLASSES.items():
            if emotion in class_set:
                class_totals[class_name] += weight

    dominant_class = max(class_totals, key=class_totals.get)

    # -------------------------
    # STEP 2 — Filter emotions inside dominant class
    # -------------------------

    class_emotions = {
        e: w for e, w in weights.items()
        if e in EMOTION_CLASSES[dominant_class]
    }

    if not class_emotions:
        return {
            "mode": "single",
            "emotions": ["neutral"],
            "animations": ["idle.fbx"]
        }

    max_weight = max(class_emotions.values())

    top_emotions = [
        e for e, w in class_emotions.items()
        if w == max_weight
    ]

    # -------------------------
    # STEP 3 — Determine playback mode
    # -------------------------

    if len(top_emotions) == 1:
        emotion = top_emotions[0]
        return {
            "mode": "single",
            "emotions": [emotion],
            "animations": [EMOTION_TO_ANIMATION.get(emotion, "idle.fbx")]
        }

    else:
        # Multiple equal emotions → loop mode
        return {
            "mode": "loop",
            "emotions": top_emotions,
            "animations": [
                EMOTION_TO_ANIMATION.get(e, "idle.fbx")
                for e in top_emotions
            ]
        }


def apply_emotional_decay(new_weights, previous_weights):
    """
    Blends previous emotional state with new state.
    """

    if not previous_weights:
        return new_weights

    blended = {}

    all_keys = set(new_weights.keys()) | set(previous_weights.keys())

    for key in all_keys:
        new_val = new_weights.get(key, 0)
        old_val = previous_weights.get(key, 0)

        blended[key] = (
            old_val * DECAY_FACTOR +
            new_val * (1 - DECAY_FACTOR)
        )

    # Normalize again
    total = sum(blended.values())
    if total > 0:
        blended = {k: v / total for k, v in blended.items()}

    return blended
