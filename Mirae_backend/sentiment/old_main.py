import string
from collections import Counter
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.sentiment.vader import SentimentIntensityAnalyzer


# -------------------------------------------------
# Load lexicon ONCE (not per request)
# -------------------------------------------------

LEXICON = {}
EMOTION_TO_ANIMATION = {
    "joy": "happy.fbx",
    "sadness": "sad.fbx",
    "anger": "angry.fbx",
    "fear": "scared.fbx",
    "surprise": "reacting.fbx",
    "trust": "trust.fbx",
    "anticipation": "excited.fbx",
    "disgust": "disappointed.fbx",
    "positive": "celebrating.fbx",
    "negative": "depressed.fbx",
    "neutral": "idle.fbx"
}

with open("sentiment/NRC-Emotion-Lexicon-Wordlevel-v0.92.txt", "r") as f:
    for line in f:
        parts = line.strip().split("\t")
        if len(parts) == 3:
          word, emotion, value = parts
          if value == "1":
            LEXICON.setdefault(word, []).append(emotion)


lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words("english"))
sid = SentimentIntensityAnalyzer()


# -------------------------------------------------
# MAIN SERVICE FUNCTION
# -------------------------------------------------

def analyze_text(text: str) -> dict:
    """
    Takes raw journal text.
    Returns emotion weights dictionary for animation.
    """

    # clean text
    text = text.lower()
    text = text.translate(str.maketrans("", "", string.punctuation))

    tokens = word_tokenize(text)

    words = [
        lemmatizer.lemmatize(w)
        for w in tokens
        if w not in stop_words
    ]

    emotions = []

    for word in words:
        if word in LEXICON:
            emotions.extend(LEXICON[word])

    counts = Counter(emotions)

    if not counts:
        return {
            "primary_emotion": "neutral",
            "animation": "idle.fbx",
            "weights": {"neutral": 1.0}
        }

    total = sum(counts.values())
    weights = {k: v / total for k, v in counts.items()}

    primary_emotion = max(weights, key=weights.get)

    animation_file = EMOTION_TO_ANIMATION.get(
        primary_emotion,
        "idle.fbx"
    )

    return {
        "primary_emotion": primary_emotion,
        "animation": animation_file,
        "weights": weights
    }

