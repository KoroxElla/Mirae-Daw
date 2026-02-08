from .emotion_templates import EMOTION_TEMPLATES

# emotion_mapper.py
"""
🎭 EMOTION MAPPER - Detailed animation library

This file contains:
1. POSTURE_TO_BONES: Maps posture descriptors to specific bone rotations
2. FACE_TO_BLENDSHAPES: Maps face descriptors to ARKit blendshape values
3. BREATHING_MODS: Maps procedural values to breathing parameters
4. BLINKING_MODS: Maps emotions to blinking patterns

All values are based on actual bone names from your avatar and ARKit blendshapes.
"""

import math

# ======================================================
# Blinking behaviour presets
# ======================================================

BLINKING_MODS = {
    "default": {
        "rate": 0.25,        # blinks per second
        "hold_time": 0.12
    },

    "sad": {
        "rate_multiplier": 0.6,   # slower blinking
        "hold_time": 0.18
    },

    "anxious": {
        "rate_multiplier": 1.6,   # fast blinking
        "hold_time": 0.08
    },

    "fearful": {
        "rate_multiplier": 0.4,   # wide eyes, fewer blinks
        "hold_time": 0.05
    },

    "happy": {
        "rate_multiplier": 1.1,
        "hold_time": 0.10
    },

    "tired": {
        "rate_multiplier": 0.8,
        "hold_time": 0.25
    }
}


# ============================================================================
# 1. POSTURE MAPPINGS - Bone rotations for each posture component
# ============================================================================
# Format: {posture_descriptor: {bone_name: {axis: value}}}
# Values are in radians (THREE.js uses radians)

POSTURE_TO_BONES = {
    # 🟢 UPRIGHT / OPEN POSTURES
    "upright": {
        "Spine": {"x": -0.05, "transition_speed": 0.6},
        "Spine1": {"x": -0.03, "transition_speed": 0.6},
        "Spine2": {"x": -0.02, "transition_speed": 0.6},
        "Neck": {"x": 0.0, "transition_speed": 0.5},
        "LeftShoulder": {"z": -0.03, "transition_speed": 0.4},
        "RightShoulder": {"z": 0.03, "transition_speed": 0.4}
    },
    
    "open_chest": {
        "Spine2": {"y": 0.1, "transition_speed": 0.5},
        "LeftShoulder": {"z": -0.1, "transition_speed": 0.5},
        "RightShoulder": {"z": 0.1, "transition_speed": 0.5}
    },
    
    "relaxed_shoulders": {
        "LeftShoulder": {"y": -0.05, "transition_speed": 0.3},
        "RightShoulder": {"y": 0.05, "transition_speed": 0.3},
        "LeftShoulder": {"z": -0.02, "transition_speed": 0.3},
        "RightShoulder": {"z": 0.02, "transition_speed": 0.3}
    },
    
    "expansive": {
        "Spine2": {"y": 0.15, "transition_speed": 0.6},
        "LeftShoulder": {"z": -0.15, "transition_speed": 0.5},
        "RightShoulder": {"z": 0.15, "transition_speed": 0.5},
        "Head": {"x": 0.05, "transition_speed": 0.4}
    },
    
    "chest_out": {
        "Spine2": {"y": 0.12, "transition_speed": 0.6},
        "Spine1": {"y": 0.08, "transition_speed": 0.5},
        "Head": {"x": 0.03, "transition_speed": 0.4}
    },
    
    "head_high": {
        "Neck": {"x": -0.08, "transition_speed": 0.5},
        "Head": {"x": 0.04, "transition_speed": 0.4}
    },
    
    # 🔴 SLOUCHED / COLLAPSED POSTURES
    "slouched": {
        "Spine": {"x": 0.12, "transition_speed": 0.8},
        "Spine1": {"x": 0.18, "transition_speed": 0.8},
        "Spine2": {"x": 0.22, "transition_speed": 0.8},
        "Neck": {"x": 0.18, "transition_speed": 0.6},
        "LeftShoulder": {"z": 0.66, "transition_speed": 0.5},
        "RightShoulder": {"z": -0.66, "transition_speed": 0.5}
    },
    
    "slouched_bored": {
        "Spine": {"x": 0.15, "transition_speed": 0.7},
        "Spine1": {"x": 0.20, "transition_speed": 0.7},
        "Spine2": {"x": 0.25, "transition_speed": 0.7},
        "Neck": {"x": 0.15, "transition_speed": 0.5},
        "Head": {"z": 0.1, "transition_speed": 0.4}
    },
    
    "collapsed_chest": {
        "Spine2": {"y": -0.08, "transition_speed": 0.6},
        "LeftShoulder": {"z": 0.05, "transition_speed": 0.5},
        "RightShoulder": {"z": -0.05, "transition_speed": 0.5}
    },
    
    "slumped": {
        "Spine": {"x": 0.10, "transition_speed": 0.7},
        "Spine1": {"x": 0.15, "transition_speed": 0.7},
        "Spine2": {"x": 0.18, "transition_speed": 0.7},
        "Neck": {"x": 0.12, "transition_speed": 0.6}
    },
    
    "heavy": {
        "Spine1": {"x": 0.12, "transition_speed": 0.8},
        "Spine2": {"x": 0.15, "transition_speed": 0.8}
    },
    
    "shrinking": {
        "Spine2": {"y": -0.05, "transition_speed": 0.6},
        "LeftShoulder": {"z": 0.03, "transition_speed": 0.5},
        "RightShoulder": {"z": -0.03, "transition_speed": 0.5},
        "Head": {"x": 0.15, "transition_speed": 0.4}
    },
    
    "head_down": {
        "Neck": {"x": 0.25, "transition_speed": 0.6},
        "Head": {"x": 0.10, "transition_speed": 0.5}
    },
    
    "closed_off": {
        "LeftShoulder": {"z": 0.3, "transition_speed": 0.5},
        "RightShoulder": {"z": -0.3, "transition_speed": 0.5},
        "LeftArm": {"y": 0.1, "transition_speed": 0.4},
        "RightArm": {"y": -0.1, "transition_speed": 0.4}
    },
    
    # 🔵 TENSE / ALERT POSTURES
    "tense": {
        "LeftShoulder": {"y": 0.06, "transition_speed": 0.7},
        "RightShoulder": {"y": -0.06, "transition_speed": 0.7},
        "Neck": {"x": -0.02, "transition_speed": 0.5},
        "Spine2": {"x": -0.01, "transition_speed": 0.4}
    },
    
    "squared_shoulders": {
        "LeftShoulder": {"y": 0.08, "transition_speed": 0.6},
        "RightShoulder": {"y": -0.08, "transition_speed": 0.6},
        "LeftShoulder": {"z": -0.05, "transition_speed": 0.5},
        "RightShoulder": {"z": 0.05, "transition_speed": 0.5}
    },
    
    "hunched": {
        "Spine": {"x": 0.05, "transition_speed": 0.6},
        "Spine1": {"x": 0.08, "transition_speed": 0.6},
        "Spine2": {"x": 0.10, "transition_speed": 0.6},
        "LeftShoulder": {"y": 0.1, "transition_speed": 0.5},
        "RightShoulder": {"y": -0.1, "transition_speed": 0.5}
    },
    
    "self_hug": {
        "LeftArm": {"y": 0.8, "transition_speed": 0.6},
        "RightArm": {"y": -0.8, "transition_speed": 0.6},
        "LeftForeArm": {"x": 0.4, "transition_speed": 0.5},
        "RightForeArm": {"x": 0.4, "transition_speed": 0.5}
    },
    
    "rigid": {
        "Spine": {"x": -0.03, "transition_speed": 0.8},
        "Spine1": {"x": -0.02, "transition_speed": 0.8},
        "Spine2": {"x": -0.01, "transition_speed": 0.8},
        "Neck": {"x": -0.01, "transition_speed": 0.7}
    },
    
    "protective": {
        "LeftShoulder": {"y": 0.15, "transition_speed": 0.6},
        "RightShoulder": {"y": -0.15, "transition_speed": 0.6},
        "LeftArm": {"y": 0.3, "transition_speed": 0.5},
        "RightArm": {"y": -0.3, "transition_speed": 0.5}
    },
    
    # 🟡 MOVEMENT / LEANING POSTURES
    "forward_lean": {
        "Spine": {"x": -0.08, "transition_speed": 0.6},
        "Spine1": {"x": -0.06, "transition_speed": 0.6},
        "Spine2": {"x": -0.04, "transition_speed": 0.6},
        "Hips": {"x": 0.02, "transition_speed": 0.4}
    },
    
    "attentive": {
        "Spine": {"x": -0.04, "transition_speed": 0.5},
        "Head": {"x": 0.02, "transition_speed": 0.4},
        "Neck": {"x": -0.01, "transition_speed": 0.4}
    },
    
    "ready_to_move": {
        "Hips": {"x": -0.02, "transition_speed": 0.5},
        "Spine": {"x": -0.03, "transition_speed": 0.5},
        "LeftUpLeg": {"x": 0.01, "transition_speed": 0.4},
        "RightUpLeg": {"x": 0.01, "transition_speed": 0.4}
    },
    
    "energetic": {
        "Spine2": {"x": -0.02, "transition_speed": 0.7},
        "Head": {"x": 0.03, "transition_speed": 0.6}
    },
    
    "forward_tilt": {
        "Spine": {"x": -0.06, "transition_speed": 0.5},
        "Head": {"x": 0.04, "transition_speed": 0.4}
    },
    
    "head_tilt": {
        "Neck": {"z": 0.15, "transition_speed": 0.4},
        "Head": {"z": 0.05, "transition_speed": 0.4}
    },
    
    "uncertain": {
        "Head": {"z": 0.1, "transition_speed": 0.3},
        "Neck": {"z": 0.05, "transition_speed": 0.3},
        "Spine2": {"y": 0.02, "transition_speed": 0.3}
    },
    
    "hesitant": {
        "Spine2": {"y": 0.03, "transition_speed": 0.4},
        "Head": {"z": 0.08, "transition_speed": 0.3}
    },
    
    # 🟣 ARM SPECIFIC POSTURES
    "sad_arms": {
        # Slump the shoulders inward
        "LeftShoulder": {"y": 2.25, "transition_speed": 0.6},
        "RightShoulder": {"y": -2.25, "transition_speed": 0.6},
        
        # Shoulders stay in front
        "LeftShoulder": {"x": 0.18, "transition_speed": 0.5},
        "RightShoulder": {"x": -0.18, "transition_speed": 0.5},
        
        # Slight forward droop
        "LeftArm": {"z": 1.62, "transition_speed": 0.4},
        "RightArm": {"z": -1.62, "transition_speed": 0.4},
        
        "LeftArm": {"y": -0.22, "transition_speed": 0.4},
        "RightArm": {"y": 0.22, "transition_speed": 0.4},
        
        "LeftForeArm": {"x": 1.80, "transition_speed": 0.4},  # Fixed from 16.99
        "RightForeArm": {"x": 1.80, "transition_speed": 0.4},  # Fixed from 16.99
        
        "LeftForeArm": {"z": -0.92, "transition_speed": 0.4},
        "RightForeArm": {"z": 0.92, "transition_speed": 0.4},
        
        "LeftForeArm": {"y": 1.12, "transition_speed": 0.4},
        "RightForeArm": {"y": 1.12, "transition_speed": 0.4}
    },
    
    "open_arms": {
        "LeftShoulder": {"z": -0.3, "transition_speed": 0.5},
        "RightShoulder": {"z": 0.3, "transition_speed": 0.5},
        "LeftArm": {"y": -0.2, "transition_speed": 0.4},
        "RightArm": {"y": 0.2, "transition_speed": 0.4}
    },
    
    "soft_posture": {
        "Spine": {"x": 0.02, "transition_speed": 0.4},
        "LeftShoulder": {"z": -0.05, "transition_speed": 0.3},
        "RightShoulder": {"z": 0.05, "transition_speed": 0.3}
    },
    
    # 🟠 GENERAL POSTURES
    "relaxed": {
        "Spine": {"x": 0.03, "transition_speed": 0.3},
        "Spine1": {"x": 0.02, "transition_speed": 0.3},
        "LeftShoulder": {"y": -0.02, "transition_speed": 0.3},
        "RightShoulder": {"y": 0.02, "transition_speed": 0.3}
    },
    
    "neutral": {
        # Minimal adjustments - baseline
        "Spine": {"x": 0.0, "transition_speed": 0.2},
        "Spine1": {"x": 0.0, "transition_speed": 0.2},
        "Spine2": {"x": 0.0, "transition_speed": 0.2}
    },
    
    "comfortable": {
        "Spine": {"x": 0.01, "transition_speed": 0.3},
        "Spine1": {"x": 0.01, "transition_speed": 0.3},
        "Spine2": {"x": 0.01, "transition_speed": 0.3}
    },
    
    "balanced": {
        "Spine": {"x": 0.0, "transition_speed": 0.2},
        "Head": {"x": 0.0, "transition_speed": 0.2}
    },
    
    "still": {
        "Spine": {"x": -0.01, "transition_speed": 0.8},
        "Spine1": {"x": -0.01, "transition_speed": 0.8},
        "Spine2": {"x": -0.01, "transition_speed": 0.8}
    },
    
    "controlled": {
        "Spine": {"x": -0.02, "transition_speed": 0.7},
        "Spine1": {"x": -0.01, "transition_speed": 0.7},
        "Spine2": {"x": -0.01, "transition_speed": 0.7}
    },
    
    "frozen": {
        "Spine": {"x": -0.01, "transition_speed": 0.9},
        "Spine1": {"x": -0.01, "transition_speed": 0.9},
        "Spine2": {"x": -0.01, "transition_speed": 0.9},
        "Neck": {"x": -0.01, "transition_speed": 0.9}
    },
    
    "jump_ready": {
        "Hips": {"x": -0.03, "transition_speed": 0.7},
        "Spine": {"x": -0.02, "transition_speed": 0.7},
        "LeftUpLeg": {"x": 0.02, "transition_speed": 0.6},
        "RightUpLeg": {"x": 0.02, "transition_speed": 0.6}
    },
    
    "alert": {
        "Spine": {"x": -0.03, "transition_speed": 0.8},
        "Head": {"x": 0.02, "transition_speed": 0.7},
        "Neck": {"x": -0.01, "transition_speed": 0.7}
    },
    
    "leaning": {
        "Spine": {"x": 0.08, "transition_speed": 0.5},
        "Hips": {"x": 0.02, "transition_speed": 0.4}
    },
    
    "disengaged": {
        "Spine": {"x": 0.12, "transition_speed": 0.4},
        "Head": {"z": 0.15, "transition_speed": 0.3},
        "LeftShoulder": {"z": 0.1, "transition_speed": 0.3},
        "RightShoulder": {"z": -0.1, "transition_speed": 0.3}
    },
    
    "engaged": {
        "Spine": {"x": -0.04, "transition_speed": 0.5},
        "Head": {"x": 0.03, "transition_speed": 0.4},
        "Neck": {"x": -0.02, "transition_speed": 0.4}
    }
}

# ============================================================================
# 2. FACE MAPPINGS - ARKit blendshape values for each face component
# ============================================================================
# Format: {face_descriptor: {blendshape_name: value}}
# Values are from 0.0 to 1.0

FACE_TO_BLENDSHAPES = {
    # 🟢 POSITIVE / HAPPY FACES
    "smile": {
        "mouthSmileLeft": 0.6,
        "mouthSmileRight": 0.6,
        "cheekSquintLeft": 0.3,
        "cheekSquintRight": 0.3,
        "eyeSquintLeft": 0.2,
        "eyeSquintRight": 0.2
    },
    
    "bright_eyes": {
        "eyeWideLeft": 0.3,
        "eyeWideRight": 0.3,
        "eyeLookUpLeft": 0.1,
        "eyeLookUpRight": 0.1
    },
    
    "relaxed_brows": {
        "browInnerUp": 0.1,
        "browOuterUpLeft": 0.05,
        "browOuterUpRight": 0.05
    },
    
    "open_mouth_smile": {
        "mouthSmileLeft": 0.7,
        "mouthSmileRight": 0.7,
        "jawOpen": 0.15,
        "mouthUpperUpLeft": 0.2,
        "mouthUpperUpRight": 0.2
    },
    
    "raised_brows": {
        "browInnerUp": 0.4,
        "browOuterUpLeft": 0.3,
        "browOuterUpRight": 0.3
    },
    
    "soft_smile": {
        "mouthSmileLeft": 0.4,
        "mouthSmileRight": 0.4,
        "cheekSquintLeft": 0.15,
        "cheekSquintRight": 0.15
    },
    
    "gentle_eyes": {
        "eyeSquintLeft": 0.1,
        "eyeSquintRight": 0.1,
        "eyeLookDownLeft": 0.05,
        "eyeLookDownRight": 0.05
    },
    
    "warm_smile": {
        "mouthSmileLeft": 0.5,
        "mouthSmileRight": 0.5,
        "cheekSquintLeft": 0.25,
        "cheekSquintRight": 0.25,
        "eyeSquintLeft": 0.15,
        "eyeSquintRight": 0.15
    },
    
    "soft_eyes": {
        "eyeSquintLeft": 0.05,
        "eyeSquintRight": 0.05,
        "eyeLookDownLeft": 0.1,
        "eyeLookDownRight": 0.1
    },
    
    "affectionate": {
        "mouthSmileLeft": 0.4,
        "mouthSmileRight": 0.4,
        "eyeSquintLeft": 0.1,
        "eyeSquintRight": 0.1,
        "head_tilt": 0.2  # This would map to Neck bone rotation
    },
    
    "determined": {
        "browDownLeft": 0.2,
        "browDownRight": 0.2,
        "mouthPressLeft": 0.1,
        "mouthPressRight": 0.1
    },
    
    "steady_gaze": {
        "eyeLookDownLeft": -0.1,  # Looking slightly up
        "eyeLookDownRight": -0.1,
        "eyeSquintLeft": 0.05,
        "eyeSquintRight": 0.05
    },
    
    "neutral_mouth": {
        "mouthClose": 0.8,
        "mouthSmileLeft": 0.0,
        "mouthSmileRight": 0.0,
        "mouthFrownLeft": 0.0,
        "mouthFrownRight": 0.0
    },
    
    "slight_smile": {
        "mouthSmileLeft": 0.25,
        "mouthSmileRight": 0.25,
        "cheekSquintLeft": 0.1,
        "cheekSquintRight": 0.1
    },
    
    "interested": {
        "eyeWideLeft": 0.2,
        "eyeWideRight": 0.2,
        "browInnerUp": 0.15,
        "mouthSmileLeft": 0.15,
        "mouthSmileRight": 0.15
    },
    
    # 🔴 NEGATIVE / SAD FACES
    "downturned_mouth": {
        "mouthFrownLeft": 0.85,
        "mouthFrownRight": 0.85,
        "mouthLowerDownLeft": 0.4,
        "mouthLowerDownRight": 0.4,
        "jawOpen": 0.04
    },
    
    "droopy_eyes": {
        "eyeSquintLeft": 1.65,
        "eyeSquintRight": 1.65,
        "eyeLookDownLeft": 0.65,
        "eyeLookDownRight": 0.65
    },
    
    "sad_brows": {
        "browInnerUp": 0.45,
        "browDownLeft": 0.15,
        "browDownRight": 0.15
    },
    
    "scowl": {
        "browDownLeft": 0.8,
        "browDownRight": 0.8,
        "mouthFrownLeft": 0.6,
        "mouthFrownRight": 0.6,
        "noseSneerLeft": 0.3,
        "noseSneerRight": 0.3
    },
    
    "narrowed_eyes": {
        "eyeSquintLeft": 0.9,
        "eyeSquintRight": 0.9,
        "browDownLeft": 0.3,
        "browDownRight": 0.3
    },
    
    "tight_mouth": {
        "mouthPressLeft": 0.7,
        "mouthPressRight": 0.7,
        "mouthClose": 0.9,
        "jawOpen": 0.0
    },
    
    "wide_eyes": {
        "eyeWideLeft": 0.6,
        "eyeWideRight": 0.6,
        "browInnerUp": 0.3,
        "browOuterUpLeft": 0.2,
        "browOuterUpRight": 0.2
    },
    
    "tense_mouth": {
        "mouthPressLeft": 0.5,
        "mouthPressRight": 0.5,
        "mouthClose": 0.8,
        "mouthFrownLeft": 0.2,
        "mouthFrownRight": 0.2
    },
    
    "worried_brows": {
        "browInnerUp": 0.6,
        "browDownLeft": 0.1,
        "browDownRight": 0.1
    },
    
    "wide_eyes_frozen": {
        "eyeWideLeft": 0.9,
        "eyeWideRight": 0.9,
        "eyeBlinkLeft": 0.0,  # Force eyes open
        "eyeBlinkRight": 0.0,
        "browInnerUp": 0.7
    },
    
    "open_mouth_fear": {
        "jawOpen": 0.3,
        "mouthStretchLeft": 0.2,
        "mouthStretchRight": 0.2,
        "mouthFrownLeft": 0.4,
        "mouthFrownRight": 0.4
    },
    
    "raised_brows_fear": {
        "browInnerUp": 0.8,
        "browOuterUpLeft": 0.6,
        "browOuterUpRight": 0.6
    },
    
    "low_energy": {
        "eyeSquintLeft": 0.4,
        "eyeSquintRight": 0.4,
        "eyeLookDownLeft": 0.3,
        "eyeLookDownRight": 0.3,
        "browInnerUp": 0.1
    },
    
    "blush": {
        "cheekPuff": 0.3,
        "cheekSquintLeft": 0.2,
        "cheekSquintRight": 0.2
    },
    
    "averted_gaze": {
        "eyeLookOutLeft": 0.4,
        "eyeLookOutRight": -0.4,  # Look away in opposite directions
        "head_avert": 0.3  # This would map to Head bone rotation
    },
    
    "awkward_smile": {
        "mouthSmileLeft": 0.3,
        "mouthSmileRight": 0.3,
        "mouthPressLeft": 0.2,
        "mouthPressRight": 0.2,
        "eyeSquintLeft": 0.1,
        "eyeSquintRight": 0.1
    },
    
    # 🟡 NEUTRAL / COMPLEX FACES
    "relaxed": {
        "eyeSquintLeft": 0.05,
        "eyeSquintRight": 0.05,
        "mouthClose": 0.5,
        "browInnerUp": 0.0
    },
    
    "neutral_expression": {
        "mouthClose": 0.5,
        "eyeSquintLeft": 0.0,
        "eyeSquintRight": 0.0,
        "browInnerUp": 0.0,
        "browDownLeft": 0.0,
        "browDownRight": 0.0
    },
    
    "calm": {
        "eyeSquintLeft": 0.1,
        "eyeSquintRight": 0.1,
        "mouthClose": 0.6,
        "browInnerUp": 0.05
    },
    
    "concentrated": {
        "browDownLeft": 0.3,
        "browDownRight": 0.3,
        "eyeSquintLeft": 0.15,
        "eyeSquintRight": 0.15,
        "mouthPressLeft": 0.1,
        "mouthPressRight": 0.1
    },
    
    "focused_brows": {
        "browDownLeft": 0.4,
        "browDownRight": 0.4,
        "browInnerUp": 0.1
    },
    
    "puzzled": {
        "browInnerUp": 0.3,
        "browDownLeft": 0.1,
        "browDownRight": 0.1,
        "eyeSquintLeft": 0.2,
        "eyeSquintRight": 0.2,
        "head_tilt": 0.2
    },
    
    "squinting": {
        "eyeSquintLeft": 0.4,
        "eyeSquintRight": 0.4,
        "browDownLeft": 0.2,
        "browDownRight": 0.2
    },
    
    "head_tilt_face": {
        # This would combine blendshapes with head bone rotation
        "mouthSmileLeft": 0.1,
        "mouthSmileRight": 0.1,
        "eyeSquintLeft": 0.05,
        "eyeSquintRight": 0.05,
        "head_tilt": 0.25  # Neck/Head bone rotation
    },
    
    "wide_eyes_shock": {
        "eyeWideLeft": 1.0,
        "eyeWideRight": 1.0,
        "eyeBlinkLeft": 0.0,  # Force open
        "eyeBlinkRight": 0.0,
        "browInnerUp": 0.9,
        "browOuterUpLeft": 0.7,
        "browOuterUpRight": 0.7
    },
    
    "open_mouth_surprise": {
        "jawOpen": 0.4,
        "mouthStretchLeft": 0.3,
        "mouthStretchRight": 0.3,
        "mouthFunnel": 0.1
    },
    
    "raised_brows_shock": {
        "browInnerUp": 0.9,
        "browOuterUpLeft": 0.8,
        "browOuterUpRight": 0.8
    },
    
    "blank": {
        "eyeSquintLeft": 0.0,
        "eyeSquintRight": 0.0,
        "mouthClose": 0.5,
        "browInnerUp": 0.0,
        "browDownLeft": 0.0,
        "browDownRight": 0.0
    },
    
    "half_lidded": {
        "eyeSquintLeft": 0.7,
        "eyeSquintRight": 0.7,
        "eyeLookDownLeft": 0.3,
        "eyeLookDownRight": 0.3
    },
    
    "uninterested": {
        "eyeSquintLeft": 0.5,
        "eyeSquintRight": 0.5,
        "eyeLookDownLeft": 0.2,
        "eyeLookDownRight": 0.2,
        "mouthClose": 0.6
    }
}

# =========================================================
# 3. BREATHING
# =========================================================

def get_breathing_params(arousal: float):
    """
    Convert arousal → breathing rate/amplitude
    """

    base_rate = 0.35
    base_amp = 0.05

    rate = base_rate * (1 + arousal * 0.8)
    amp = base_amp * (1 + arousal * 0.6)

    return {
        "rate": rate,
        "amplitude": amp
    }

# ============================================================================
# 4. CONVERSION HELPER FUNCTIONS
# ============================================================================
def get_blinking_params(emotion_name, intensity=1.0):
    """
    Get blinking parameters for an emotion.
    
    Args:
        emotion_name: Emotion name
        intensity: Emotion intensity
        
    Returns:
        Dict with rate and hold_time
    """
    base_rate = BLINKING_MODS["default"]["rate"]
    base_hold = BLINKING_MODS["default"]["hold_time"]
    
    if emotion_name in BLINKING_MODS:
        override = BLINKING_MODS[emotion_name]
        rate = base_rate * override.get("rate_multiplier", 1.0)
        hold_time = override.get("hold_time", base_hold)
    else:
        rate = base_rate
        hold_time = base_hold
    
    # Apply intensity scaling (more intense = more emotion-specific blinking)
    rate = base_rate + (rate - base_rate) * intensity
    hold_time = base_hold + (hold_time - base_hold) * intensity
    
    return {
        "rate": rate,
        "hold_time": hold_time
    }

def get_posture_animation(postures, intensity=1.0):
    """
    ["slouched","sad_arms"] → bone dict
    """

    result = {}

    for p in postures:
        if p not in POSTURE_TO_BONES:
            continue

        for bone, axes in POSTURE_TO_BONES[p].items():

            result.setdefault(bone, {})

            for axis, value in axes.items():

                if axis == "transition_speed":
                    result[bone][axis] = value
                else:
                    result[bone][axis] = value * intensity

    return result

def get_face_animation(faces, intensity=1.0):
    """
    ["smile"] → blendshape dict
    """

    result = {}

    for f in faces:
        if f not in FACE_TO_BLENDSHAPES:
            continue

        for k, v in FACE_TO_BLENDSHAPES[f].items():
            result[k] = v * intensity

    return result

# =========================================================
# 5. BLENDING ENGINE
# =========================================================

def _blend_two(a, b, factor):
    """
    Linear interpolation between two dict animations
    """

    if factor <= 0:
        return a
    if factor >= 1:
        return b

    out = {}

    keys = set(a.keys()) | set(b.keys())

    for k in keys:

        v1 = a.get(k, 0)
        v2 = b.get(k, 0)

        if isinstance(v1, dict) and isinstance(v2, dict):
            out[k] = _blend_two(v1, v2, factor)

        elif isinstance(v1, (int, float)) and isinstance(v2, (int, float)):
            out[k] = v1 + (v2 - v1) * factor

        else:
            out[k] = v2 if factor > 0.5 else v1

    return out

def blend_multiple(animations):
    """
    animations = [
        (animation_dict, weight),
        (animation_dict, weight)
    ]
    """

    if not animations:
        return {}

    result = animations[0]

    for anim in animations[1:]:
        result = _blend_two(result, anim, 0.5)

    return result
