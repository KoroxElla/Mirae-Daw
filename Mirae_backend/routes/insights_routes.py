from flask import Blueprint, jsonify
from services.firebase_service import get_emotion_history, db, get_latest_insight
from services.jwt_middleware import require_auth
from datetime import datetime, timedelta
from services.insight_service import generate_weekly_insight

insights_bp = Blueprint("insights", __name__, url_prefix="/insights")

@insights_bp.route("/emotion-history", methods=["GET"])
@require_auth
def emotion_history(user_id):

    history = get_emotion_history(user_id)

    return jsonify(history), 200


@insight_bp.route("/weekly", methods=["GET"])
@require_auth
def weekly_insight(user_id):

    latest = get_latest_insight(user_id)

    if latest:

        unlock_time = latest["generatedAt"] + timedelta(days=7)

        if datetime.utcnow() < unlock_time:

            days_left = (unlock_time - datetime.utcnow()).days

            return jsonify({
                "locked": True,
                "daysRemaining": days_left
            }), 200

    insight = generate_weekly_insight(user_id)

    if not insight:
        return jsonify({
            "locked": True,
            "daysRemaining": 7
        }), 200

    db.collection("users")\
        .document(user_id)\
        .collection("insights")\
        .add(insight)

    return jsonify({
        "locked": False,
        "insight": insight
    }), 200
