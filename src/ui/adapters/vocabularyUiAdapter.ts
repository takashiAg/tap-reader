import { vocabularyUseCases } from '../../application/container';
import type { VocabularyCard, VocabularyDeck, VocabularyReviewMark } from '../../domain/vocabulary/vocabulary';
import type {
  UiVocabularyCard,
  UiVocabularyDeck,
  UiVocabularyReviewMark,
  VocabularyUiPort,
} from '../ports/vocabularyPort';

export const vocabularyUiAdapter: VocabularyUiPort = {
  getSampleDeck() {
    return toUiDeck(vocabularyUseCases.getSampleDeck());
  },

  async extractDeckFromImage(imageUri) {
    return toUiDeck(await vocabularyUseCases.extractDeckFromImage(imageUri));
  },

  speakCard(card) {
    vocabularyUseCases.speakCard(toDomainCard(card));
  },

  speakMeaning(card) {
    vocabularyUseCases.speakMeaning(toDomainCard(card));
  },

  getNextReviewMark(current) {
    return vocabularyUseCases.getNextReviewMark(current);
  },
};

function toUiDeck(deck: VocabularyDeck): UiVocabularyDeck {
  return {
    id: deck.id,
    title: deck.title,
    source: deck.source,
    cards: deck.cards.map(toUiCard),
    createdAt: deck.createdAt,
  };
}

function toUiCard(card: VocabularyCard): UiVocabularyCard {
  return {
    id: card.id,
    korean: card.korean,
    japanese: card.japanese,
    reading: card.reading,
    example: card.example,
    note: card.note,
    confidence: card.confidence,
  };
}

function toDomainCard(card: UiVocabularyCard): VocabularyCard {
  return {
    id: card.id,
    korean: card.korean,
    japanese: card.japanese,
    reading: card.reading,
    example: card.example,
    note: card.note,
    confidence: card.confidence,
  };
}

const _typeCheckReviewMark: VocabularyReviewMark = 'unknown';
const _typeCheckUiReviewMark: UiVocabularyReviewMark = _typeCheckReviewMark;
void _typeCheckUiReviewMark;
