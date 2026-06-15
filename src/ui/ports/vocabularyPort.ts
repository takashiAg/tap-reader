export type UiVocabularyReviewMark = 'unknown' | 'learning' | 'known';

export type UiVocabularyCard = {
  id: string;
  korean: string;
  japanese: string;
  reading?: string;
  example?: string;
  note?: string;
  confidence: number;
};

export type UiVocabularyDeck = {
  id: string;
  title: string;
  source: 'sample' | 'image';
  cards: UiVocabularyCard[];
  createdAt: number;
};

export type VocabularyUiPort = {
  getSampleDeck(): UiVocabularyDeck;
  extractDeckFromImage(imageUri: string): Promise<UiVocabularyDeck>;
  speakCard(card: UiVocabularyCard): void;
  speakMeaning(card: UiVocabularyCard): void;
  getNextReviewMark(current: UiVocabularyReviewMark): UiVocabularyReviewMark;
};
