export type UiTutorMode = 'meaning' | 'pronunciation' | 'conversation';

export type UiPracticePhrase = {
  id: string;
  korean: string;
  japanese: string;
  romanization: string;
  hint: string;
};

export type UiTutorMessage = {
  id: string;
  role: 'assistant' | 'learner';
  text: string;
  korean?: string;
  createdAt: number;
};

export type UiPronunciationReview = {
  score: number;
  summary: string;
  missedWords: string[];
  extraWords: string[];
  tips: string[];
};

export type TutorUiPort = {
  getInitialPhrase(): UiPracticePhrase;
  getInitialMessages(phrase: UiPracticePhrase): UiTutorMessage[];
  getNextPhrase(currentPhraseId: string): UiPracticePhrase;
  askTutor(input: {
    mode: UiTutorMode;
    currentPhrase: UiPracticePhrase;
    messages: UiTutorMessage[];
    learnerText: string;
  }): Promise<UiTutorMessage>;
  reviewPronunciation(phrase: UiPracticePhrase, transcript: string): UiPronunciationReview;
  speakKorean(text: string, rate?: number): void;
  speakJapanese(text: string): void;
  stopSpeech(): void;
};
