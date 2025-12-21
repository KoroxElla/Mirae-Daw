

BASE_PROFILES = {
    "positive": {
        "face": {
            "mouth_smile": 0.6,
            "eye_openness": 0.3
        },
        "body": {
            "spine_slouch": -0.2
        }
    },

    "negative": {
        "face": {
            "mouth_frown": 0.6,
            "eye_openness": -0.3
        },
        "body": {
            "spine_slouch": 0.5
        }
    },

    "tense": {
        "face": {
            "jaw_tension": 0.6,
            "brow_lower": 0.4
        },
        "gesture": {
            "hand_fidget": 0.5
        }
    },

    "neutral": {
        "face": {},
        "body": {}
    }
}

