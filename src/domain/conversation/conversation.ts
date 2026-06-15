export type TutorRole = 'system' | 'assistant' | 'learner';

export type TutorMode = 'meaning' | 'pronunciation' | 'conversation';

export type TutorMessage = {
  id: string;
  role: TutorRole;
  text: string;
  korean?: string;
  createdAt: number;
};

export type PracticePhrase = {
  id: string;
  korean: string;
  japanese: string;
  romanization: string;
  hint: string;
  level: 'beginner' | 'casual';
};

export type PronunciationReview = {
  expected: string;
  transcript: string;
  score: number;
  summary: string;
  missedWords: string[];
  extraWords: string[];
  tips: string[];
};

export type TutorReply = {
  message: TutorMessage;
  nextPhrase?: PracticePhrase;
};
