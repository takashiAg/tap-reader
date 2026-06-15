export type UiLanguageId = 'ko' | 'ja' | 'en' | 'zh';

export type UiRecognitionMode = 'word' | 'character';

export type UiLanguageProfile = {
  id: UiLanguageId;
  label: string;
  nativeName: string;
  wordHint: string;
  characterHint: string;
};

export type UiRecognizedToken = {
  id: string;
  text: string;
  reading?: string;
  meaning?: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
};

export type UiRecognitionFrame = {
  languageId: UiLanguageId;
  mode: UiRecognitionMode;
  tokens: UiRecognizedToken[];
  capturedAt: number;
};

export type LiveReaderUiPort = {
  getLanguages(): UiLanguageProfile[];
  getLanguage(languageId: UiLanguageId): UiLanguageProfile;
  getInitialFrame(languageId: UiLanguageId, mode: UiRecognitionMode): UiRecognitionFrame;
  recognizeLiveFrame(
    languageId: UiLanguageId,
    mode: UiRecognitionMode,
    step: number,
  ): UiRecognitionFrame;
  recognizeStillImage(
    imageUri: string,
    languageId: UiLanguageId,
    mode: UiRecognitionMode,
  ): Promise<UiRecognitionFrame>;
  speakToken(token: UiRecognizedToken, languageId: UiLanguageId): void;
  speakFrame(tokens: UiRecognizedToken[], languageId: UiLanguageId): void;
  stopSpeech(): void;
};
