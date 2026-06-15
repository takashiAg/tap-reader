import type { LanguageId, LanguageProfile } from '../domain/language/language';
import type {
  RecognitionFrame,
  RecognitionMode,
} from '../domain/recognition/recognition';
import type {
  PracticePhrase,
  PronunciationReview,
  TutorMessage,
  TutorMode,
  TutorReply,
} from '../domain/conversation/conversation';
import type { VocabularyDeck } from '../domain/vocabulary/vocabulary';

export type OcrPort = {
  recognizeLiveFrame(languageId: LanguageId, mode: RecognitionMode, step: number): RecognitionFrame;
  recognizeStillImage(imageUri: string, languageId: LanguageId, mode: RecognitionMode): Promise<RecognitionFrame>;
};

export type SpeechPort = {
  speak(text: string, language: LanguageProfile, rate?: number): void;
  stop(): void;
};

export type TutorPort = {
  reply(input: {
    mode: TutorMode;
    currentPhrase: PracticePhrase;
    messages: TutorMessage[];
    learnerText: string;
  }): Promise<TutorReply>;
};

export type PronunciationReviewPort = {
  review(expected: PracticePhrase, transcript: string): PronunciationReview;
};

export type VocabularyExtractionPort = {
  extractDeckFromImage(imageUri: string): Promise<VocabularyDeck>;
};
