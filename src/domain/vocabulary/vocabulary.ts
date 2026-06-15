export type VocabularyCard = {
  id: string;
  korean: string;
  japanese: string;
  reading?: string;
  example?: string;
  note?: string;
  confidence: number;
};

export type VocabularyDeck = {
  id: string;
  title: string;
  source: 'sample' | 'image';
  cards: VocabularyCard[];
  createdAt: number;
};

export type VocabularyReviewMark = 'unknown' | 'learning' | 'known';
