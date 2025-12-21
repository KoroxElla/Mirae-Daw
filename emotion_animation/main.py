

from collections import Counter
from emotion_mapper import normalize_emotions, blend_emotions

emotion_counts = Counter({
    'happy': 5,
    'hated': 2,
    'entitled': 2,
    'attached': 1,
    'attracted': 1,
    'alone': 1,
    'free': 1,
    'loved': 1
})

normalized = normalize_emotions(emotion_counts)
schema = blend_emotions(normalized)

print("Normalized emotions:")
print(normalized)

print("\nFinal animation schema:")
print(schema)

