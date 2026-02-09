from flask import Flask, jsonify, request
from flask_cors import CORS

from emotion_templates import EMOTION_TEMPLATES
from emotion_mapper import (
        get_posture_animation,
        get_face_animation,
        get_breathing_params,
        get_blinking_params,
        blend_multiple
        )

app = Flask(__name__)
CORS(app)


# =========================================================
# Utility
# =========================================================

def normalize(weights: dict):
    total = sum(weights.values())
    if total == 0:
        return {"neutral": 1.0}
    return {k: v / total for k, v in weights.items()}

# ----------------------------
# Fake sentiment (for testing)
# ----------------------------
def fake_sentiment(text: str):

    text = text.lower()

    if "sad" in text:
        return {"sad" : 0.8}

    if "scared" in text or "anxious" in text :
        return {"anxious" : 0.7}
    if "happy" in text :
        return {"happy" : 0.9}

    return {
        "sad": 0.6,
        "anxiety": 0.4
    }

# =========================================================
# Core mapping logic
# =========================================================

def build_animation_from_weights(weights):
    weights = normalize(weights)

    animations = []

    for emotion_name, weight in weights.items():

        if emotion_name not in EMOTION_TEMPLATES:
            continue

        template = EMOTION_TEMPLATES[emotion_name]

        posture_anim = get_posture_animation(
            template["posture"],
            intensity=template["intensity"] * weight
        )

        face_anim = get_face_animation(
            template["face"],
            intensity=template["intensity"] * weight
        )

        breathing = get_breathing_params(
            template["arousal"],
        )

        blinking = get_blinking_params(
            emotion_name,
            template["intensity"] * weight
        )

        animations.append({
            "posture": posture_anim,
            "face": face_anim,
            "breathing": breathing,
            "blinking": blinking
        })

    blended = blend_multiple(animations)

    # --------------------------------------------------
    # Convert to Animator.js instruction format
    # --------------------------------------------------

    instructions = {
        "bones": [],
        "face": [],
        "procedural": {}
    }

    for bone, axes in blended.get("posture", {}).items():
        for axis, value in axes.items():
            if axis == "transition_speed":
                continue

            instructions["bones"].append({
                "bone": bone,
                "axis": axis,
                "value": value,
                "weight": 0.5
            })

    for morph, value in blended.get("face", {}).items():
        instructions["face"].append({
            "morph": morph,
            "value": value
        })

    instructions["procedural"] = {
        "breathing": blended.get("breathing", {}),
        "blink": blended.get("blinking", {})
    }

    return instructions

# ----------------------------
# API endpoint
# ----------------------------
@app.route("/emotion", methods=["POST"])
def emotion():

    data = request.json
    text = data.get("text", "")

    weights = fake_sentiment(text)

    instructions = build_animation_from_weights(weights)

    return jsonify(instructions)


if __name__ == "__main__":
    app.run(port=5000, debug=True)

