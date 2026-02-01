<<<<<<< HEAD
from emotion_templates import EMOTION_TEMPLATES
from emotion_modifiers import EMOTION_MODIFIERS
=======
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
        "Spine": {"x": 0.08, "transition_speed": 0.8},
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

# ============================================================================
# 3. BREATHING MODIFICATIONS
# ============================================================================
# Maps arousal values to breathing parameters

BREATHING_MODS = {
    "default": {
        "rate": 0.35,        # Breaths per second
        "amplitude": 0.05,   # Max spine rotation in radians
        "spine_bones": ["Spine2", "Spine1"]
    },
    
    "arousal_to_rate": lambda arousal: 0.35 * (1 + arousal * 0.8),  # Higher arousal = faster breathing
    "arousal_to_amplitude": lambda arousal: 0.05 * (1 + arousal * 0.6),  # Higher arousal = deeper breaths
    
    # Emotion-specific overrides
    "anxious": {"rate_multiplier": 1.8, "amplitude_multiplier": 1.3},
    "fearful": {"rate_multiplier": 2.2, "amplitude_multiplier": 0.7},
    "sad": {"rate_multiplier": 0.6, "amplitude_multiplier": 1.4},
    "angry": {"rate_multiplier": 1.4, "amplitude_multiplier": 1.5},
    "happy": {"rate_multiplier": 0.9, "amplitude_multiplier": 1.1},
    "excited": {"rate_multiplier": 1.6, "amplitude_multiplier": 1.4},
    "tired": {"rate_multiplier": 0.5, "amplitude_multiplier": 1.2}
}

# ============================================================================
# 4. BLINKING MODIFICATIONS
# ============================================================================

BLINKING_MODS = {
    "default": {
        "rate": 3.0,        # Blinks per minute
        "hold_time": 0.15   # Seconds eyes stay closed
    },
    
    # Emotion-specific overrides
    "sad": {"rate_multiplier": 0.7, "hold_time": 0.25},
    "anxious": {"rate_multiplier": 2.5, "hold_time": 0.08},
    "fearful": {"rate_multiplier": 1.2, "hold_time": 0.2},
    "angry": {"rate_multiplier": 0.5, "hold_time": 0.1},
    "happy": {"rate_multiplier": 0.8, "hold_time": 0.18},
    "focused": {"rate_multiplier": 0.4, "hold_time": 0.12},
    "surprised": {"rate_multiplier": 0.1, "hold_time": 0.05},  # Very few blinks when surprised
    "bored": {"rate_multiplier": 1.5, "hold_time": 0.3}        # More frequent, longer blinks
}

# ============================================================================
# 5. PROCEDURAL MOVEMENT MAPPINGS
# ============================================================================

PROCEDURAL_MOVEMENTS = {
    "movement_speed_to_head_sway": lambda speed: 0.002 * speed,
    "movement_speed_to_micro_movements": lambda speed: 0.001 * speed,
    
    # Head micro-movements based on arousal
    "arousal_to_head_jitter": lambda arousal: 0.0002 * arousal if arousal > 0.7 else 0.0,
    
    # Eye darting based on arousal and valence
    "arousal_to_eye_dart_speed": lambda arousal: 2.0 + arousal * 3.0,
    "valence_to_eye_brightness": lambda valence: 0.3 + valence * 0.4,
}

# ============================================================================
# 6. HELPER FUNCTIONS
# ============================================================================

def get_posture_animation(posture_components, intensity=1.0, available_bones=None):
    """
    Convert posture components to bone animations.
    
    Args:
        posture_components: List of posture descriptors
        intensity: Emotion intensity (0.0 to 1.0)
        available_bones: Set of bones that exist in the avatar
        
    Returns:
        Dict of {bone_name: {axis: value, transition_speed: speed}}
    """
    animation = {}
    
    for component in posture_components:
        if component in POSTURE_TO_BONES:
            bone_data = POSTURE_TO_BONES[component]
            
            for bone_name, adjustments in bone_data.items():
                # Skip if bone doesn't exist
                if available_bones and bone_name not in available_bones:
                    continue
                
                if bone_name not in animation:
                    animation[bone_name] = {}
                
                for axis, value in adjustments.items():
                    if axis == "transition_speed":
                        # Transition speed is not scaled by intensity
                        animation[bone_name][axis] = value
                    else:
                        # Apply intensity scaling to rotation values
                        animation[bone_name][axis] = value * intensity
    
    return animation


def get_face_animation(face_components, intensity=1.0):
    """
    Convert face components to blendshape animations.
    
    Args:
        face_components: List of face descriptors
        intensity: Emotion intensity (0.0 to 1.0)
        
    Returns:
        Dict of {blendshape_name: value}
    """
    animation = {}
    
    for component in face_components:
        if component in FACE_TO_BLENDSHAPES:
            blendshape_data = FACE_TO_BLENDSHAPES[component]
            
            for blendshape_name, value in blendshape_data.items():
                # Apply intensity scaling
                animation[blendshape_name] = value * intensity
    
    return animation
>>>>>>> 3955391b90074b9e78cbe8f2a6d976bb2560d632


def get_breathing_params(arousal, emotion_name=None):
    """
    Get breathing parameters based on arousal and emotion.
    
    Args:
        arousal: Arousal value (0.0 to 1.0)
        emotion_name: Optional emotion name for specific overrides
        
    Returns:
        Dict with rate and amplitude
    """
    base_rate = BREATHING_MODS["default"]["rate"]
    base_amplitude = BREATHING_MODS["default"]["amplitude"]
    
    # Apply arousal-based modifications
    rate = BREATHING_MODS["arousal_to_rate"](arousal)
    amplitude = BREATHING_MODS["arousal_to_amplitude"](arousal)
    
    # Apply emotion-specific overrides if available
    if emotion_name and emotion_name in BREATHING_MODS:
        override = BREATHING_MODS[emotion_name]
        rate *= override.get("rate_multiplier", 1.0)
        amplitude *= override.get("amplitude_multiplier", 1.0)
    
    return {
        "rate": rate,
        "amplitude": amplitude,
        "spine_bones": BREATHING_MODS["default"]["spine_bones"]
    }


<<<<<<< HEAD
def blend_emotions(normalized_emotions):
    accumulator = {}
    procedural_blocks = {}
=======
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
>>>>>>> 3955391b90074b9e78cbe8f2a6d976bb2560d632


<<<<<<< HEAD
        base = EMOTION_TEMPLATES[emotion]
        modifier = EMOTION_MODIFIERS.get(emotion, {})

        for source in (base, modifier):

            # ✅ STEP 1: Collect procedural data (NO blending)
            if "procedural" in source:
                procedural_blocks.update(source["procedural"])

            # ✅ STEP 2: Blend numeric animation values
            for category, params in source.items():
                if category == "procedural":
                    continue

                accumulator.setdefault(category, {})

                for param, value in params.items():

                    # Support {"base": x} or raw numbers
                    if isinstance(value, dict):
                        if "base" not in value:
                            continue
                        numeric_value = value["base"]
                    else:
                        numeric_value = value

                    accumulator[category].setdefault(
                        param, {"sum": 0.0, "weight": 0.0}
                    )

                    accumulator[category][param]["sum"] += numeric_value * intensity
                    accumulator[category][param]["weight"] += intensity

    # ✅ STEP 3: Final averaged schema
    final_schema = {}

    for category, params in accumulator.items():
        final_schema[category] = {}
        for param, data in params.items():
            if data["weight"] > 0:
                final_schema[category][param] = round(
                    data["sum"] / data["weight"], 3
                )

    # ✅ STEP 4: Attach procedural instructions untouched
    if procedural_blocks:
        final_schema["procedural"] = procedural_blocks

    return final_schema
=======
def blend_animations(animation1, animation2, blend_factor):
    """
    Blend two animations together.
    
    Args:
        animation1: First animation dict
        animation2: Second animation dict
        blend_factor: 0.0 = all animation1, 1.0 = all animation2
        
    Returns:
        Blended animation dict
    """
    if blend_factor <= 0:
        return animation1
    if blend_factor >= 1:
        return animation2
    
    blended = {}
    
    # Get all unique keys
    all_keys = set(animation1.keys()) | set(animation2.keys())
    
    for key in all_keys:
        val1 = animation1.get(key, {})
        val2 = animation2.get(key, {})
        
        if isinstance(val1, dict) and isinstance(val2, dict):
            # Blend nested dictionaries (for bones with multiple axes)
            blended[key] = {}
            all_subkeys = set(val1.keys()) | set(val2.keys())
            
            for subkey in all_subkeys:
                subval1 = val1.get(subkey, 0)
                subval2 = val2.get(subkey, 0)
                
                if isinstance(subval1, (int, float)) and isinstance(subval2, (int, float)):
                    blended[key][subkey] = subval1 + (subval2 - subval1) * blend_factor
                else:
                    # For non-numeric values (like transition_speed), use animation2 if blend_factor > 0.5
                    blended[key][subkey] = subval2 if blend_factor > 0.5 else subval1
        elif isinstance(val1, (int, float)) and isinstance(val2, (int, float)):
            # Blend numeric values
            blended[key] = val1 + (val2 - val1) * blend_factor
        else:
            # For other types, use animation2 if blend_factor > 0.5
            blended[key] = val2 if blend_factor > 0.5 else val1
    
    return blended
>>>>>>> 3955391b90074b9e78cbe8f2a6d976bb2560d632

