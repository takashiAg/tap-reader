import { readerUseCases } from '../../application/container';
import { getLanguageProfile, languageProfiles } from '../../domain/language/languageProfiles';
import type { LanguageId, LanguageProfile } from '../../domain/language/language';
import type {
  RecognitionFrame,
  RecognitionMode,
  RecognizedToken,
} from '../../domain/recognition/recognition';
import type {
  LiveReaderUiPort,
  UiLanguageId,
  UiLanguageProfile,
  UiRecognitionFrame,
  UiRecognitionMode,
  UiRecognizedToken,
} from '../ports/liveReaderPort';

export const liveReaderUiAdapter: LiveReaderUiPort = {
  getLanguages() {
    return languageProfiles.map(toUiLanguageProfile);
  },

  getLanguage(languageId) {
    return toUiLanguageProfile(getLanguageProfile(languageId));
  },

  getInitialFrame(languageId, mode) {
    return toUiRecognitionFrame(readerUseCases.recognizeLiveFrame(languageId, mode, 0));
  },

  recognizeLiveFrame(languageId, mode, step) {
    return toUiRecognitionFrame(readerUseCases.recognizeLiveFrame(languageId, mode, step));
  },

  async recognizeStillImage(imageUri, languageId, mode) {
    const frame = await readerUseCases.recognizeStillImage(imageUri, languageId, mode);
    return toUiRecognitionFrame(frame);
  },

  speakToken(token, languageId) {
    readerUseCases.speakToken(toDomainToken(token), getLanguageProfile(languageId));
  },

  speakFrame(tokens, languageId) {
    readerUseCases.speakFrame(
      tokens.map(toDomainToken),
      getLanguageProfile(languageId),
      languageId,
    );
  },

  stopSpeech() {
    readerUseCases.stopSpeech();
  },
};

function toUiLanguageProfile(language: LanguageProfile): UiLanguageProfile {
  return {
    id: language.id,
    label: language.label,
    nativeName: language.nativeName,
    wordHint: language.wordHint,
    characterHint: language.characterHint,
  };
}

function toUiRecognitionFrame(frame: RecognitionFrame): UiRecognitionFrame {
  return {
    languageId: frame.languageId,
    mode: frame.mode,
    capturedAt: frame.capturedAt,
    tokens: frame.tokens.map(toUiToken),
  };
}

function toUiToken(token: RecognizedToken): UiRecognizedToken {
  return {
    id: token.id,
    text: token.text,
    reading: token.reading,
    meaning: token.meaning,
    confidence: token.confidence,
    bounds: token.bounds,
  };
}

function toDomainToken(token: UiRecognizedToken): RecognizedToken {
  return {
    id: token.id,
    text: token.text,
    reading: token.reading,
    meaning: token.meaning,
    confidence: token.confidence,
    bounds: token.bounds,
  };
}

const _typeCheckLanguageId: LanguageId = 'ko';
const _typeCheckRecognitionMode: RecognitionMode = 'word';
void _typeCheckLanguageId;
void _typeCheckRecognitionMode;
