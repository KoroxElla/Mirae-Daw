EMOTION_TEMPLATES = {
    # 🟢 POSITIVE / PLEASANT EMOTIONS
    "happy": {
        "posture": ["upright", "open_chest", "relaxed_shoulders"],
        "face": ["smile", "bright_eyes", "relaxed_brows"],
        "arousal": 0.7, 
        "intensity": 0.8
    },
    
    "excited": {
        "posture": ["energetic", "forward_lean", "ready_to_move"],
        "face": ["wide_eyes", "open_mouth_smile", "raised_brows"],
        "arousal": 0.9,
        "intensity": 0.9
    },
    
    "content": {
        "posture": ["relaxed", "neutral", "comfortable"],
        "face": ["soft_smile", "gentle_eyes", "relaxed"],
        "arousal": 0.3,
        "intensity": 0.6
    },
    
    "loved": { 
        "posture": ["open_arms", "soft_posture", "forward_tilt"],
        "face": ["warm_smile", "soft_eyes", "affectionate"],
        "arousal": 0.5,
        "intensity": 0.7
    },
    
    "confident": {
        "posture": ["expansive", "chest_out", "head_high"],
        "face": ["determined", "steady_gaze", "neutral_mouth"],
        "arousal": 0.6,
        "intensity": 0.7
    },
    
    # 🔴 NEGATIVE / UNPLEASANT EMOTIONS
    "sadness": {
        "posture": ["slouched", "sad_arms", "collapsed_chest"],
        "face": ["downturned_mouth", "droopy_eyes", "sad_brows"],
        "arousal": 0.3,
        "intensity": 0.8
    },
    
    "angry": {
        "posture": ["tense", "forward_lean", "squared_shoulders"],
        "face": ["scowl", "narrowed_eyes", "tight_mouth"],
        "arousal": 0.9,
        "intensity": 0.9
    },
    
    "anxious": {
        "posture": ["tense", "hunched", "self_hug"],
        "face": ["wide_eyes", "tense_mouth", "worried_brows"],
        "arousal": 0.8,
        "intensity": 0.7
    },
    
    "fearful": {
        "posture": ["rigid", "hunched", "protective"],
        "face": ["wide_eyes_frozen", "open_mouth_fear", "raised_brows_fear"],
        "arousal": 0.9,
        "intensity": 0.9
    },
    
    "tired": {
        "posture": ["slumped", "heavy", "leaning"],
        "face": ["droopy_eyes", "relaxed_mouth", "low_energy"],
        "arousal": 0.2,
        "intensity": 0.6
    },
    
    "embarrassed": {
        "posture": ["shrinking", "head_down", "closed_off"],
        "face": ["blush", "averted_gaze", "awkward_smile"],
        "arousal": 0.7,
        "intensity": 0.7
    },
    
    # 🟡 NEUTRAL / COMPLEX EMOTIONS
    "neutral": {
        "posture": ["balanced", "relaxed", "neutral"],
        "face": ["relaxed", "neutral_expression", "calm"],
        "arousal": 0.5,
        "intensity": 0.5
    },
    
    "focused": {
        "posture": ["still", "upright", "controlled"],
        "face": ["concentrated", "steady_gaze", "focused_brows"],
        "arousal": 0.6,
        "intensity": 0.7
    },
    
    "confused": {
        "posture": ["uncertain", "head_tilt", "hesitant"],
        "face": ["puzzled", "squinting", "head_tilt_face"],
        "arousal": 0.5,
        "intensity": 0.6
    },
    
    "surprised": {
        "posture": ["frozen", "jump_ready", "alert"],
        "face": ["wide_eyes_shock", "open_mouth_surprise", "raised_brows_shock"],
        "arousal": 0.9,
        "intensity": 0.9
    },
    
    "bored": {
        "posture": ["slouched_bored", "leaning", "disengaged"],
        "face": ["blank", "half_lidded", "uninterested"],
        "arousal": 0.2,
        "intensity": 0.5
    },
    
    "curious": {
        "posture": ["forward_lean", "attentive", "engaged"],
        "face": ["interested", "bright_eyes", "slight_smile"],
        "arousal": 0.6,
        "intensity": 0.6
    }
}
