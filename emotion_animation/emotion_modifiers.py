EMOTION_MODIFIERS = {

    # =====================
    # POSITIVE EMOTIONS
    # =====================

    "happy": {
        "face": {
            "mouth_smile": {"base": 0.8},
            "left_eyebrow_raise": {"base": 0.3},
            "right_eyebrow_raise": {"base": 0.3},
            "eye_openness": {"base": 0.45}
        },
        "procedural": {
            "blink": {
                "rate": 0.25
            }
        }
    },

    "loved": {
        "face": {
            "mouth_smile": {"base": 0.7},
            "eye_openness": {"base": 0.4}
        },
        "procedural": {
            "blink": {
                "rate": 0.2
            }
        }
    },

    # =====================
    # NEGATIVE / LOW ENERGY
    # =====================

    "alone": {
        "face": {
            "mouth_frown": {"base": 0.4},
            "eye_openness": {"base": 0.25}
        },
        "procedural": {
            "blink": {
                "rate": 0.15
            }
        }
    },

    "hated": {
        "face": {
            "brow_lower": {"base": 0.6},
            "jaw_tension": {"base": 0.5},
            "eye_openness": {"base": 0.35}
        }
    },

    # =====================
    # HIGH TENSION EMOTIONS
    # =====================

    "anxious": {
        "face": {
            "jaw_tension": {"base": 0.6},
            "eye_openness": {"base": 0.5}
        },
        "procedural": {
            "blink": {
                "rate": 0.6
            }
        }
    },

    "entitled": {
        "face": {
            "brow_lower": {"base": 0.4}
        }
    },

    "annoyed": {
        "face": {
            "brow_lower": {"base": 0.6},
            "jaw_tension": {"base": 0.4},
            "eye_openness": {"base": 0.35}
        },
        "procedural": {
            "eye_twitch": {
                "side": "left",
                "amplitude": 0.25,
                "frequency": 6
            }
        }
    }
}

