

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

    for emotion, intensity in normalized_emotions.items():
        if emotion not in EMOTION_TEMPLATES:
            continue

        base = EMOTION_TEMPLATES[emotion]
        modifier = EMOTION_MODIFIERS.get(emotion, {})

        for source in (base, modifier):
            for category, params in source.items():
                accumulator.setdefault(category, {})

                for param, value in params.items():
                    accumulator[category].setdefault(param, {"sum": 0.0, "weight": 0.0})
                    accumulator[category][param]["sum"] += value * intensity
                    accumulator[category][param]["weight"] += intensity

    final_schema = {}

    for category, params in accumulator.items():
        final_schema[category] = {}
        for param, data in params.items():
            if data["weight"] > 0:
                final_schema[category][param] = round(
                    data["sum"] / data["weight"], 3
                )

    return final_schema

