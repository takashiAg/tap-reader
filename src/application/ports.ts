import type { LanguageProfile } from '../domain/language/language';
import type { LanguageId } from '../domain/language/language';
import type {
  RecognitionFrame,
  RecognitionMode,
} from '../domain/recognition/recognition';

export type OcrPort = {
  recognizeLiveFrame(languageId: LanguageId, mode: RecognitionMode, step: number): RecognitionFrame;
  recognizeStillImage(imageUri: string, languageId: LanguageId, mode: RecognitionMode): Promise<RecognitionFrame>;
};

export type SpeechPort = {
  speak(text: string, language: LanguageProfile, rate?: number): void;
  stop(): void;
};
