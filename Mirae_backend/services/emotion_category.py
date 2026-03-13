EMOTION_CATEGORY = {

    "joy": "positive",
    "trust": "positive",
    "anticipation": "positive",

    "sadness": "negative",
    "anger": "negative",
    "fear": "negative",
    "disgust": "negative",

    "surprise": "neutral",
    "neutral": "neutral"
}


def get_category(emotion):
    return EMOTION_CATEGORY.get(emotion, "neutral")
