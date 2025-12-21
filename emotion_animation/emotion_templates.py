

from base_profiles import BASE_PROFILES

EMOTION_TEMPLATES = {

    # Tier 1
    "happy": BASE_PROFILES["positive"],
    "loved": BASE_PROFILES["positive"],
    "attached": BASE_PROFILES["positive"],

    "sad": BASE_PROFILES["negative"],
    "alone": BASE_PROFILES["negative"],
    "hated": BASE_PROFILES["negative"],
    "powerless": BASE_PROFILES["negative"],

    "angry": BASE_PROFILES["tense"],
    "anxious": BASE_PROFILES["tense"],
    "fearful": BASE_PROFILES["tense"],
    "entitled": BASE_PROFILES["tense"],

    # Tier 2
    "embarrassed": BASE_PROFILES["negative"],
    "demoralized": BASE_PROFILES["negative"],
    "bored": BASE_PROFILES["neutral"],
    "esteemed": BASE_PROFILES["positive"],
    "burdened": BASE_PROFILES["negative"],

    # Tier 3
    "free": BASE_PROFILES["neutral"],
    "independent": BASE_PROFILES["neutral"],
    "focused": BASE_PROFILES["neutral"],
    "adequate": BASE_PROFILES["neutral"],
    "average": BASE_PROFILES["neutral"],
    "safe": BASE_PROFILES["neutral"]
}

