from emotion_templates import EMOTION_TEMPLATES
from emotion_modifiers import EMOTION_MODIFIERS


def normalize_emotions(emotion_counter):
    total = sum(emotion_counter.values())
    if total == 0:
        return {}

    return {
        emotion: count / total
        for emotion, count in emotion_counter.items()
    }


def blend_emotions(normalized_emotions):
    accumulator = {}
    procedural_blocks = {}

    for emotion, intensity in normalized_emotions.items():
        if emotion not in EMOTION_TEMPLATES:
            continue

        base = EMOTION_TEMPLATES[emotion]
        modifier = EMOTION_MODIFIERS.get(emotion, {})

        for source in (base, modifier):

            # ✅ STEP 1: Collect procedural data (NO blending)
            if "procedural" in source:
                procedural_blocks.update(source["procedural"])

            # ✅ STEP 2: Blend numeric animation values
            for category, params in source.items():
                if category == "procedural":
                    continue

                accumulator.setdefault(category, {})

                for param, value in params.items():

                    # Support {"base": x} or raw numbers
                    if isinstance(value, dict):
                        if "base" not in value:
                            continue
                        numeric_value = value["base"]
                    else:
                        numeric_value = value

                    accumulator[category].setdefault(
                        param, {"sum": 0.0, "weight": 0.0}
                    )

                    accumulator[category][param]["sum"] += numeric_value * intensity
                    accumulator[category][param]["weight"] += intensity

    # ✅ STEP 3: Final averaged schema
    final_schema = {}

    for category, params in accumulator.items():
        final_schema[category] = {}
        for param, data in params.items():
            if data["weight"] > 0:
                final_schema[category][param] = round(
                    data["sum"] / data["weight"], 3
                )

    # ✅ STEP 4: Attach procedural instructions untouched
    if procedural_blocks:
        final_schema["procedural"] = procedural_blocks

    return final_schema

