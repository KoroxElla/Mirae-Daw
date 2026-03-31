EMOTION_CATEGORY = {

    "joy": "positive",
<<<<<<< HEAD
=======
    "trust": "positive",
    "anticipation": "positive",
>>>>>>> 36a9f3824f595c788305ef6b99b71a1198038ec3

    "sadness": "negative",
    "anger": "negative",
    "fear": "negative",
    "disgust": "negative",

    "surprise": "neutral",
    "neutral": "neutral"
}


def get_category(emotion):
<<<<<<< HEAD

    if isinstance(emotion, list):
        emotion = emotion[0]

=======
>>>>>>> 36a9f3824f595c788305ef6b99b71a1198038ec3
    return EMOTION_CATEGORY.get(emotion, "neutral")
