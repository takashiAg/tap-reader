import type { LanguageId } from '../language/language';

export type RecognitionMode = 'word' | 'character';

export type Bounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type RecognizedToken = {
  id: string;
  text: string;
  reading?: string;
  meaning?: string;
  bounds: Bounds;
  confidence: number;
};

export type RecognitionFrame = {
  languageId: LanguageId;
  mode: RecognitionMode;
  tokens: RecognizedToken[];
  capturedAt: number;
};
