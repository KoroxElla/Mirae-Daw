EMOTION_TEMPLATES = {
    # 🟢 POSITIVE / PLEASANT EMOTIONS
    "happy": {
        "description": "Open, energetic, upward-facing expression",
        "posture": ["upright", "open_chest", "relaxed_shoulders"],
        "face": ["smile", "bright_eyes", "relaxed_brows"],
        "procedural": {
            "arousal": 0.7,      # Medium-high energy
            "valence": 0.8,      # Very positive
            "movement_speed": 1.2  # Slightly faster movements
        },
        "intensity": 0.8,
        "priority": 2
    },
    
    "excited": {
        "description": "High energy, bouncy, anticipatory",
        "posture": ["energetic", "forward_lean", "ready_to_move"],
        "face": ["wide_eyes", "open_mouth_smile", "raised_brows"],
        "procedural": {
            "arousal": 0.9,
            "valence": 0.9,
            "movement_speed": 1.5
        },
        "intensity": 0.9,
        "priority": 3
    },
    
    "content": {
        "description": "Peaceful, satisfied, relaxed",
        "posture": ["relaxed", "neutral", "comfortable"],
        "face": ["soft_smile", "gentle_eyes", "relaxed"],
        "procedural": {
            "arousal": 0.3,
            "valence": 0.7,
            "movement_speed": 0.8
        },
        "intensity": 0.6,
        "priority": 1
    },
    
    "loved": {
        "description": "Warm, open-hearted, affectionate",
        "posture": ["open_arms", "soft_posture", "forward_tilt"],
        "face": ["warm_smile", "soft_eyes", "affectionate"],
        "procedural": {
            "arousal": 0.5,
            "valence": 0.9,
            "movement_speed": 0.9
        },
        "intensity": 0.7,
        "priority": 2
    },
    
    "confident": {
        "description": "Strong, self-assured, expansive",
        "posture": ["expansive", "chest_out", "head_high"],
        "face": ["determined", "steady_gaze", "neutral_mouth"],
        "procedural": {
            "arousal": 0.6,
            "valence": 0.7,
            "movement_speed": 1.0
        },
        "intensity": 0.7,
        "priority": 2
    },
    
    # 🔴 NEGATIVE / UNPLEASANT EMOTIONS
    "sad": {
        "description": "Collapsed inward, slow, heavy",
        "posture": ["slouched", "sad_arms", "collapsed_chest"],
        "face": ["downturned_mouth", "droopy_eyes", "sad_brows"],
        "procedural": {
            "arousal": 0.3,
            "valence": -0.8,
            "movement_speed": 0.6
        },
        "intensity": 0.8,
        "priority": 2
    },
    
    "angry": {
        "description": "Tense, rigid, forward-aggressive",
        "posture": ["tense", "forward_lean", "squared_shoulders"],
        "face": ["scowl", "narrowed_eyes", "tight_mouth"],
        "procedural": {
            "arousal": 0.9,
            "valence": -0.9,
            "movement_speed": 0.7  # Tense, not fast
        },
        "intensity": 0.9,
        "priority": 3  # High priority - anger overrides
    },
    
    "anxious": {
        "description": "Jittery, alert, self-protective",
        "posture": ["tense", "hunched", "self_hug"],
        "face": ["wide_eyes", "tense_mouth", "worried_brows"],
        "procedural": {
            "arousal": 0.8,
            "valence": -0.6,
            "movement_speed": 1.3  # Fast, jittery
        },
        "intensity": 0.7,
        "priority": 2
    },
    
    "fearful": {
        "description": "Frozen, alert, defensive",
        "posture": ["rigid", "hunched", "protective"],
        "face": ["wide_eyes_frozen", "open_mouth_fear", "raised_brows_fear"],
        "procedural": {
            "arousal": 0.9,
            "valence": -0.9,
            "movement_speed": 0.3  # Frozen, slow
        },
        "intensity": 0.9,
        "priority": 3
    },
    
    "tired": {
        "description": "Heavy, slow, low energy",
        "posture": ["slumped", "heavy", "leaning"],
        "face": ["droopy_eyes", "relaxed_mouth", "low_energy"],
        "procedural": {
            "arousal": 0.2,
            "valence": -0.4,
            "movement_speed": 0.5
        },
        "intensity": 0.6,
        "priority": 1
    },
    
    "embarrassed": {
        "description": "Self-conscious, shrinking, avoidant",
        "posture": ["shrinking", "head_down", "closed_off"],
        "face": ["blush", "averted_gaze", "awkward_smile"],
        "procedural": {
            "arousal": 0.7,
            "valence": -0.5,
            "movement_speed": 0.8
        },
        "intensity": 0.7,
        "priority": 2
    },
    
    # 🟡 NEUTRAL / COMPLEX EMOTIONS
    "neutral": {
        "description": "Balanced, calm, natural resting state",
        "posture": ["balanced", "relaxed", "neutral"],
        "face": ["relaxed", "neutral_expression", "calm"],
        "procedural": {
            "arousal": 0.5,
            "valence": 0.0,
            "movement_speed": 1.0
        },
        "intensity": 0.5,
        "priority": 0
    },
    
    "focused": {
        "description": "Still, controlled, attentive",
        "posture": ["still", "upright", "controlled"],
        "face": ["concentrated", "steady_gaze", "focused_brows"],
        "procedural": {
            "arousal": 0.6,
            "valence": 0.1,
            "movement_speed": 0.9
        },
        "intensity": 0.7,
        "priority": 2
    },
    
    "confused": {
        "description": "Uncertain, searching, puzzled",
        "posture": ["uncertain", "head_tilt", "hesitant"],
        "face": ["puzzled", "squinting", "head_tilt_face"],
        "procedural": {
            "arousal": 0.5,
            "valence": -0.3,
            "movement_speed": 0.9
        },
        "intensity": 0.6,
        "priority": 1
    },
    
    "surprised": {
        "description": "Sudden alert, frozen reaction",
        "posture": ["frozen", "jump_ready", "alert"],
        "face": ["wide_eyes_shock", "open_mouth_surprise", "raised_brows_shock"],
        "procedural": {
            "arousal": 0.9,
            "valence": 0.0,  # Can be positive or negative
            "movement_speed": 0.2  # Frozen moment
        },
        "intensity": 0.9,
        "priority": 3
    },
    
    "bored": {
        "description": "Low energy, disinterested, sluggish",
        "posture": ["slouched_bored", "leaning", "disengaged"],
        "face": ["blank", "half_lidded", "uninterested"],
        "procedural": {
            "arousal": 0.2,
            "valence": -0.4,
            "movement_speed": 0.7
        },
        "intensity": 0.5,
        "priority": 1
    },
    
    "curious": {
        "description": "Interested, leaning in, attentive",
        "posture": ["forward_lean", "attentive", "engaged"],
        "face": ["interested", "bright_eyes", "slight_smile"],
        "procedural": {
            "arousal": 0.6,
            "valence": 0.5,
            "movement_speed": 1.1
        },
        "intensity": 0.6,
        "priority": 1
    }
}
