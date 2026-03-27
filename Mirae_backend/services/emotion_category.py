EMOTION_CATEGORY = {

    "joy": "positive",

    "sadness": "negative",
    "anger": "negative",
    "fear": "negative",
    "disgust": "negative",

    "surprise": "neutral",
    "neutral": "neutral"
}


def get_category(emotion):

    if isinstance(emotion, list):
        emotion = emotion[0]

    return EMOTION_CATEGORY.get(emotion, "neutral")
