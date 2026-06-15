import * as Speech from 'expo-speech';

import type { SpeechPort } from '../../application/ports';

export const expoSpeechAdapter: SpeechPort = {
  speak(text, language, rate = 0.86) {
    const normalized = text.trim();

    if (!normalized) {
      return;
    }

    Speech.stop();
    Speech.speak(normalized, {
      language: language.speechLocale,
      rate,
      pitch: 1,
    });
  },

  stop() {
    Speech.stop();
  },
};
