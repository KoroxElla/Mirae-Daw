const emotionPayload = {
  emotion: "anxiety",
  arousal: 0.7,
  valence: -0.4
};

const translator = new MapperTranslator(avatarProfile);
const instructions = translator.translate(emotionPayload);

