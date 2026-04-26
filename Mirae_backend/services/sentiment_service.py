from sentiment.main import analyze_text as real_sentiment_analyzer

EMOTION_MAP = {
    "joy": "joy",
    "sadness": "sadness",
    "fear": "fear",   
    "anger": "anger",
    "disgust": "disgust", 
    "surprise": "surprise",
    "neutral": "neutral"
}


def analyze_text(text: str) -> dict:
    weights = real_sentiment_analyzer(text)

    if not weights:
        return {"neutral": 1.0}

    mapped = {}

    for emotion, value in weights.items():
        d
        mapped_name = EMOTION_MAP.get(emotion, emotion)
        mapped[mapped_name] = mapped.get(mapped_name, 0) + value

    if not mapped:
        return {"neutral": 1.0}

    print("RAW SENTIMENT:", weights)
    print("MAPPED SENTIMENT:", mapped)

    return mapped
