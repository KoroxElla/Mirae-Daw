from emotion.emotion_templates import EMOTION_TEMPLATES
from emotion.emotion_mapper import (
        get_posture_animation,
        get_face_animation,
        get_breathing_params,
        get_blinking_params,
        blend_multiple
)


# ---------------------------------
# helpers
# ---------------------------------

def normalize(weights: dict):
    total = sum(weights.values())
    if total == 0:
        return {"neutral": 1.0}
    return {k: v / total for k, v in weights.items()}

# =========================================================
# Core mapping logic
# =========================================================

def build_animation(weights):
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
    
        if not isinstance(axes, dict):
            continue
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
