from flask import Blueprint, jsonify
from services.firebase_service import get_entries

reminisce_bp = Blueprint("reminisce", __name__)

@reminisce_bp.route("/reminisce/<user_id>", methods=["GET"])
def get_reminisce_nodes(user_id):

    entries = get_entries(user_id)

    nodes = []

    for entry in entries:

        preview = entry["text"][:50]

        nodes.append({
            "id": entry["id"],
            "date": entry["createdAt"],
            "emotion": entry.get("arbitration", {}).get("emotions"),
            "preview": preview
        })

    return jsonify(nodes)
