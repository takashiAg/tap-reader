import { getLanguageProfile } from '../domain/language/languageProfiles';
import { travelVocabularyDeck } from '../domain/vocabulary/sampleDeck';
import type { VocabularyCard, VocabularyReviewMark } from '../domain/vocabulary/vocabulary';
import type { SpeechPort, VocabularyExtractionPort } from './ports';

type VocabularyDependencies = {
  extraction: VocabularyExtractionPort;
  speech: SpeechPort;
};

export function createVocabularyUseCases(dependencies: VocabularyDependencies) {
  const { extraction, speech } = dependencies;

  return {
    getSampleDeck() {
      return travelVocabularyDeck;
    },

    extractDeckFromImage(imageUri: string) {
      return extraction.extractDeckFromImage(imageUri);
    },

    speakCard(card: VocabularyCard) {
      speech.speak(card.korean, getLanguageProfile('ko'), 0.82);
    },

    speakMeaning(card: VocabularyCard) {
      speech.speak(card.japanese, getLanguageProfile('ja'), 0.9);
    },

    getNextReviewMark(current: VocabularyReviewMark): VocabularyReviewMark {
      if (current === 'unknown') {
        return 'learning';
      }

      if (current === 'learning') {
        return 'known';
      }

      return 'unknown';
    },
  };
}
