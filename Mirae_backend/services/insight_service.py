from collections import Counter
from datetime import datetime, timedelta
from services.firebase_service import db


def generate_weekly_insight(user_id):

    one_week_ago = datetime.utcnow() - timedelta(days=7)

    docs = db.collection("users")\
        .document(user_id)\
        .collection("entries")\
        .where("createdAt", ">=", one_week_ago)\
        .stream()

    emotions = []
    categories = []

    for doc in docs:
        data = doc.to_dict()
        emotions.append(data.get("primaryEmotion"))
        categories.append(data.get("emotionCategory"))

    if not emotions:
        return None

    emotion_count = Counter(emotions)
    category_count = Counter(categories)

    dominant_emotion = emotion_count.most_common(1)[0][0]
    dominant_category = category_count.most_common(1)[0][0]

    insight_text = build_insight_message(
        dominant_emotion,
        dominant_category
    )

    return {
        "emotion": dominant_emotion,
        "category": dominant_category,
        "message": insight_text,
        "generatedAt": datetime.utcnow()
    }


def build_insight_message(emotion, category):

    if category == "positive":
        return (
            "This week your journal entries reflected many positive moments. "
            "You experienced emotions such as " + emotion +
            ". Keep nurturing the activities and connections that bring you joy."
        )

    if category == "negative":
        return (
            "This week your entries showed signs of emotional difficulty, "
            "especially feelings of " + emotion +
            ". Remember that difficult emotions are temporary and reflecting "
            "on them is already a strong step toward healing."
        )

    return (
        "This week your emotions were fairly balanced. "
        "Your entries showed moments of reflection and neutrality. "
        "Maintaining awareness of your feelings is an important part "
        "of emotional wellbeing."
    )
