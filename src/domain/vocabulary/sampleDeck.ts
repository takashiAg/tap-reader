import type { VocabularyDeck } from './vocabulary';

export const travelVocabularyDeck: VocabularyDeck = {
  id: 'sample-travel',
  title: '旅行に役立つ単語',
  source: 'sample',
  createdAt: 0,
  cards: [
    {
      id: 'sample-airport',
      korean: '공항',
      japanese: '空港',
      reading: 'gonghang',
      example: '공항에 가요.',
      note: '〜에 가요 は「〜へ行きます」。',
      confidence: 1,
    },
    {
      id: 'sample-ticket',
      korean: '표',
      japanese: 'チケット',
      reading: 'pyo',
      example: '표를 샀어요.',
      note: '를 は目的語につく助詞です。',
      confidence: 1,
    },
    {
      id: 'sample-hotel',
      korean: '호텔',
      japanese: 'ホテル',
      reading: 'hotel',
      example: '호텔을 예약했어요.',
      note: '예약했어요 は「予約しました」。',
      confidence: 1,
    },
    {
      id: 'sample-luggage',
      korean: '짐',
      japanese: '荷物',
      reading: 'jim',
      example: '짐이 많아요.',
      note: '이/가 は主語につく助詞です。',
      confidence: 1,
    },
  ],
};
