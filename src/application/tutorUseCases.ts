import { getPracticePhrase } from '../domain/conversation/practicePhrases';
import { getLanguageProfile } from '../domain/language/languageProfiles';
import type { PracticePhrase, TutorMessage, TutorMode } from '../domain/conversation/conversation';
import type { PronunciationReviewPort, SpeechPort, TutorPort } from './ports';

type TutorDependencies = {
  reviewer: PronunciationReviewPort;
  speech: SpeechPort;
  tutor: TutorPort;
};

export function createTutorUseCases(dependencies: TutorDependencies) {
  const { reviewer, speech, tutor } = dependencies;

  return {
    getInitialPhrase() {
      return getPracticePhrase(0);
    },

    getNextPhrase(currentPhraseId: string) {
      const currentIndex = Number(currentPhraseId.split('-').at(-1));
      if (Number.isFinite(currentIndex)) {
        return getPracticePhrase(currentIndex + 1);
      }

      const phrases = [0, 1, 2, 3].map(getPracticePhrase);
      const index = phrases.findIndex((phrase) => phrase.id === currentPhraseId);
      return getPracticePhrase(index + 1);
    },

    createInitialMessages(phrase: PracticePhrase): TutorMessage[] {
      return [
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: `まずはこの韓国語で会話練習しましょう。タップすると日本語と読み方を見られます。\n\n${phrase.korean}`,
          korean: phrase.korean,
          createdAt: Date.now(),
        },
      ];
    },

    reviewPronunciation(phrase: PracticePhrase, transcript: string) {
      return reviewer.review(phrase, transcript);
    },

    async askTutor(input: {
      mode: TutorMode;
      currentPhrase: PracticePhrase;
      messages: TutorMessage[];
      learnerText: string;
    }) {
      return tutor.reply(input);
    },

    speakKorean(text: string, rate = 0.82) {
      speech.speak(text, getLanguageProfile('ko'), rate);
    },

    speakJapanese(text: string) {
      speech.speak(text, getLanguageProfile('ja'), 0.9);
    },

    stopSpeech() {
      speech.stop();
    },
  };
}
