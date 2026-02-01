

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
    },

    
    "happy": {
        "face": {
            "mouth_smile": 0.8,
            "eye_openness": 0.4,
            "brow_raise": 0.3
        },
        "body": {
            "spine_slouch": -0.3,
            "head_tilt_up": 0.2
        },
        "gesture": {
            "hand_openness": 0.4,
            "arm_swing": 0.2
        }
    },

    "sad": {
        "face": {
            "mouth_frown": 0.7,
            "eye_openness": -0.4,
            "brow_inner_up": 0.6,
            "eye_squint": 0.3
        },
        "body": {
            "spine_slouch": 0.6,
            "head_tilt_down": 0.4,
            "shoulders_droop": 0.5
        },
        "gesture": {
            "hand_closed": 0.3,
            "arm_hug": 0.4
        }
    },

    "angry": {
        "face": {
            "mouth_press": 0.7,
            "brow_lower": 0.8,
            "eye_narrow": 0.6,
            "jaw_clench": 0.8,
            "nostril_flare": 0.5
        },
        "body": {
            "spine_straight": 0.6,
            "chest_out": 0.4,
            "shoulders_tension": 0.7
        },
        "gesture": {
            "hand_fist": 0.8,
            "arm_stiff": 0.6
        }
    },

    "fearful": {
        "face": {
            "eye_widen": 0.7,
            "brow_raise": 0.6,
            "mouth_open": 0.5,
            "jaw_tension": 0.4
        },
        "body": {
            "spine_crouch": 0.5,
            "shoulders_hunch": 0.4,
            "head_forward": 0.3
        },
        "gesture": {
            "hand_tremble": 0.7,
            "arm_protect": 0.5
        }
    },

    "surprise": {
        "face": {
            "eye_widen": 0.9,
            "brow_raise": 0.7,
            "mouth_open": 0.6,
            "head_jerk": 0.4
        },
        "body": {
            "spine_jump": 0.3,
            "shoulders_up": 0.5
        },
        "gesture": {
            "hand_flinch": 0.6
        }
    },

    "attracted": {
        "face": {
            "eye_openness": 0.5,
            "pupil_dilation": 0.6,
            "mouth_smile_slight": 0.4,
            "head_tilt": 0.3
        },
        "body": {
            "spine_lean_forward": 0.4,
            "chest_open": 0.3
        },
        "gesture": {
            "hand_open_palm": 0.5
        }
    },

    "lustful": {
        "face": {
            "eye_squint_slight": 0.4,
            "mouth_part": 0.5,
            "brow_raise_slight": 0.3,
            "lip_bite": 0.6
        },
        "body": {
            "spine_seductive_curve": 0.5,
            "hip_tilt": 0.4
        },
        "gesture": {
            "hand_sensual": 0.6
        }
    },

    "bored": {
        "face": {
            "eye_droop": 0.7,
            "mouth_flat": 0.6,
            "brow_relaxed": 0.5
        },
        "body": {
            "spine_slouch_heavy": 0.8,
            "head_support": 0.6
        },
        "gesture": {
            "hand_fidget_bored": 0.4
        }
    },

    "apathetic": {
        "face": {
            "eye_relaxed": 0.8,
            "mouth_neutral": 0.7,
            "brow_neutral": 0.6
        },
        "body": {
            "spine_lazy": 0.7,
            "limbs_relaxed": 0.8
        }
    },

    "embarrassed": {
        "face": {
            "blush": 0.8,
            "eye_avert": 0.7,
            "mouth_smile_nervous": 0.5
        },
        "body": {
            "spine_shrink": 0.6,
            "shoulders_in": 0.5
        },
        "gesture": {
            "hand_face_touch": 0.6
        }
    },

    "alone": {
        "face": {
            "eye_lonely": 0.7,
            "mouth_sad_slight": 0.5,
            "brow_pensive": 0.4
        },
        "body": {
            "spine_slouch_sad": 0.6,
            "arms_self_hug": 0.7
        }
    },

    "independent": {
        "face": {
            "eye_confident": 0.6,
            "mouth_determined": 0.5,
            "head_high": 0.7
        },
        "body": {
            "spine_straight_confident": 0.8,
            "shoulders_back": 0.6
        },
        "gesture": {
            "hand_assertive": 0.5
        }
    },

    "free": {
        "face": {
            "eye_wide_open": 0.7,
            "mouth_smile_free": 0.6,
            "head_tilt_back": 0.4
        },
        "body": {
            "spine_expansive": 0.7,
            "arms_open": 0.8
        },
        "gesture": {
            "hand_free_movement": 0.7
        }
    },

    "adequate": {
        "face": {
            "eye_content": 0.5,
            "mouth_neutral_content": 0.4,
            "brow_calm": 0.3
        },
        "body": {
            "spine_balanced": 0.5,
            "shoulders_relaxed": 0.6
        }
    },

    "safe": {
        "face": {
            "eye_peaceful": 0.6,
            "mouth_slight_smile": 0.4,
            "brow_relax": 0.5
        },
        "body": {
            "spine_comfortable": 0.5,
            "limbs_at_ease": 0.7
        }
    },

    "fearless": {
        "face": {
            "eye_steady": 0.8,
            "mouth_determined_set": 0.6,
            "brow_strong": 0.5
        },
        "body": {
            "spine_strong": 0.9,
            "chest_brave": 0.7
        },
        "gesture": {
            "hand_steady": 0.8
        }
    },

    "belittled": {
        "face": {
            "eye_shamed": 0.7,
            "mouth_tremble": 0.5,
            "brow_defeated": 0.6
        },
        "body": {
            "spine_shrunk": 0.8,
            "head_down": 0.7
        }
    },

    "cheated": {
        "face": {
            "eye_betrayed": 0.7,
            "mouth_tight": 0.6,
            "brow_tense": 0.5
        },
        "body": {
            "spine_tight": 0.6,
            "arms_cross": 0.7
        }
    },

    "singled_out": {
        "face": {
            "eye_self_conscious": 0.6,
            "mouth_uncertain": 0.5,
            "head_turn": 0.4
        },
        "body": {
            "spine_uncomfortable": 0.5,
            "shoulders_uneasy": 0.6
        }
    },

    "loved": {
        "face": {
            "eye_warm": 0.8,
            "mouth_soft_smile": 0.7,
            "brow_tender": 0.5
        },
        "body": {
            "spine_open_heart": 0.6,
            "arms_receptive": 0.7
        }
    },

    "esteemed": {
        "face": {
            "eye_proud": 0.7,
            "mouth_confident_smile": 0.6,
            "head_high_respect": 0.5
        },
        "body": {
            "spine_dignified": 0.7,
            "shoulders_respectful": 0.6
        }
    },

    "powerless": {
        "face": {
            "eye_hopeless": 0.8,
            "mouth_slack": 0.7,
            "brow_defeated": 0.6
        },
        "body": {
            "spine_collapsed": 0.9,
            "limbs_weak": 0.8
        }
    },

    "obsessed": {
        "face": {
            "eye_intense": 0.8,
            "mouth_part_intense": 0.5,
            "brow_focused_intense": 0.7
        },
        "body": {
            "spine_tense_focus": 0.6,
            "hands_twitching": 0.7
        }
    },

    "focused": {
        "face": {
            "eye_concentrated": 0.7,
            "mouth_firm": 0.4,
            "brow_focused": 0.6
        },
        "body": {
            "spine_still": 0.7,
            "hands_steady_focus": 0.8
        }
    },

    "entitled": {
        "face": {
            "eye_superior": 0.7,
            "mouth_smirk": 0.6,
            "head_tilt_arrogant": 0.5
        },
        "body": {
            "spine_arrogant": 0.6,
            "chest_puffed": 0.7
        }
    },

    "codependent": {
        "face": {
            "eye_needy": 0.7,
            "mouth_anxious_smile": 0.5,
            "brow_worried": 0.6
        },
        "body": {
            "spine_leaning": 0.7,
            "hands_clinging": 0.8
        }
    },

    "demoralized": {
        "face": {
            "eye_defeated": 0.9,
            "mouth_downturned": 0.8,
            "brow_despair": 0.7
        },
        "body": {
            "spine_defeated": 0.9,
            "shoulders_sunken": 0.8
        }
    },

    "derailed": {
        "face": {
            "eye_confused": 0.7,
            "mouth_open_slight": 0.5,
            "head_tilt_confused": 0.4
        },
        "body": {
            "spine_off_balance": 0.6,
            "arms_disorganized": 0.5
        }
    },

    "anxious": {
        "face": {
            "eye_darting": 0.7,
            "mouth_twitch": 0.5,
            "brow_tense_worry": 0.6
        },
        "body": {
            "spine_twitchy": 0.5,
            "hands_nervous": 0.8
        }
    },

    "lost": {
        "face": {
            "eye_searching": 0.7,
            "mouth_open_slight": 0.4,
            "head_turn_search": 0.6
        },
        "body": {
            "spine_uncertain": 0.7,
            "feet_shuffle": 0.5
        }
    },

    "hated": {
        "face": {
            "eye_hurt": 0.8,
            "mouth_tremble_rejection": 0.7,
            "brow_pained": 0.6
        },
        "body": {
            "spine_withdrawn": 0.8,
            "arms_protective": 0.7
        }
    },

    "average": {
        "face": {
            "eye_normal": 0.0,
            "mouth_neutral": 0.0,
            "brow_neutral": 0.0
        },
        "body": {
            "spine_normal": 0.0,
            "shoulders_normal": 0.0
        }
    },

    "burdened": {
        "face": {
            "eye_weary": 0.7,
            "mouth_strained": 0.6,
            "brow_heavy": 0.5
        },
        "body": {
            "spine_weighted": 0.8,
            "shoulders_heavy": 0.7
        }
    },

    "ecstatic": {
        "face": {
            "eye_widen_joy": 0.9,
            "mouth_wide_smile": 0.8,
            "brow_raise_joy": 0.7
        },
        "body": {
            "spine_energetic": 0.8,
            "jump_ready": 0.6
        },
        "gesture": {
            "hands_celebrate": 0.9
        }
    }
}

