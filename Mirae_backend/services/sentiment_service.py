from sentiment.main import analyze_text as real_sentiment_analyzer

EMOTION_MAP = {
    "sadness": "sad",
    "joy": "happy",
    "fear": "fearful",
    "anger": "angry",
    "negative": "sad",
    "positive": "happy"
}


def analyze_text(text: str) -> dict:
    weights = real_sentiment_analyzer(text)

    if not weights:
        return { "neutral" : 1.0}
    
    mapped = {}

    for emotion, value in weights.items():
        mapped_name = EMOTION_MAP.get(emotion)

        if mapped_name:
            mapped[mapped_name] = mapped.get(mapped_name, 0) + value

    return mapped
