import { tutorUseCases } from '../../application/container';
import type { PracticePhrase, TutorMessage, TutorMode } from '../../domain/conversation/conversation';
import type {
  TutorUiPort,
  UiPracticePhrase,
  UiPronunciationReview,
  UiTutorMessage,
  UiTutorMode,
} from '../ports/tutorPort';

export const tutorUiAdapter: TutorUiPort = {
  getInitialPhrase() {
    return toUiPhrase(tutorUseCases.getInitialPhrase());
  },

  getInitialMessages(phrase) {
    return tutorUseCases.createInitialMessages(toDomainPhrase(phrase)).map(toUiMessage);
  },

  getNextPhrase(currentPhraseId) {
    return toUiPhrase(tutorUseCases.getNextPhrase(currentPhraseId));
  },

  async askTutor(input) {
    const reply = await tutorUseCases.askTutor({
      mode: toDomainMode(input.mode),
      currentPhrase: toDomainPhrase(input.currentPhrase),
      messages: input.messages.map(toDomainMessage),
      learnerText: input.learnerText,
    });

    return toUiMessage(reply.message);
  },

  reviewPronunciation(phrase, transcript) {
    return toUiReview(tutorUseCases.reviewPronunciation(toDomainPhrase(phrase), transcript));
  },

  speakKorean(text, rate) {
    tutorUseCases.speakKorean(text, rate);
  },

  speakJapanese(text) {
    tutorUseCases.speakJapanese(text);
  },

  stopSpeech() {
    tutorUseCases.stopSpeech();
  },
};

function toUiPhrase(phrase: PracticePhrase): UiPracticePhrase {
  return {
    id: phrase.id,
    korean: phrase.korean,
    japanese: phrase.japanese,
    romanization: phrase.romanization,
    hint: phrase.hint,
  };
}

function toDomainPhrase(phrase: UiPracticePhrase): PracticePhrase {
  return {
    ...phrase,
    level: 'beginner',
  };
}

function toUiMessage(message: TutorMessage): UiTutorMessage {
  return {
    id: message.id,
    role: message.role === 'learner' ? 'learner' : 'assistant',
    text: message.text,
    korean: message.korean,
    createdAt: message.createdAt,
  };
}

function toDomainMessage(message: UiTutorMessage): TutorMessage {
  return {
    id: message.id,
    role: message.role,
    text: message.text,
    korean: message.korean,
    createdAt: message.createdAt,
  };
}

function toDomainMode(mode: UiTutorMode): TutorMode {
  return mode;
}

function toUiReview(review: ReturnType<typeof tutorUseCases.reviewPronunciation>): UiPronunciationReview {
  return {
    score: review.score,
    summary: review.summary,
    missedWords: review.missedWords,
    extraWords: review.extraWords,
    tips: review.tips,
  };
}
