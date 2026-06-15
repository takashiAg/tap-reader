import type { LanguageProfile } from '../domain/language/language';
import type { LanguageId } from '../domain/language/language';
import type { RecognitionMode, RecognizedToken } from '../domain/recognition/recognition';
import type { OcrPort, SpeechPort } from './ports';

export function createReaderUseCases(dependencies: { ocr: OcrPort; speech: SpeechPort }) {
  const { ocr, speech } = dependencies;

  return {
    recognizeLiveFrame(languageId: LanguageId, mode: RecognitionMode, step: number) {
      return ocr.recognizeLiveFrame(languageId, mode, step);
    },

    recognizeStillImage(imageUri: string, languageId: LanguageId, mode: RecognitionMode) {
      return ocr.recognizeStillImage(imageUri, languageId, mode);
    },

    speakToken(token: RecognizedToken, language: LanguageProfile) {
      speech.speak(token.text, language);
    },

    speakFrame(tokens: RecognizedToken[], language: LanguageProfile, languageId: LanguageId) {
      const joiner = languageId === 'en' ? ' ' : '';
      speech.speak(
        tokens
          .map((token) => token.text)
          .join(joiner),
        language,
        0.82,
      );
    },

    stopSpeech() {
      speech.stop();
    },
  };
}
