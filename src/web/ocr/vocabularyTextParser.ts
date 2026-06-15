import type { VocabularyCard, VocabularyDeck } from '../../domain/vocabulary/vocabulary';
import { travelVocabularyDeck } from '../../domain/vocabulary/sampleDeck';

type PendingKorean = {
  text: string;
  index: number;
};

export function createDeckFromText(text: string, title = '画像から作成'): VocabularyDeck {
  const cards = parseVocabularyCards(text);

  if (cards.length === 0) {
    return {
      ...travelVocabularyDeck,
      id: `fallback-${Date.now()}`,
      title: 'サンプル単語',
      createdAt: Date.now(),
    };
  }

  return {
    id: `deck-${Date.now()}`,
    title: `${title} ${cards.length}語`,
    source: 'image',
    cards,
    createdAt: Date.now(),
  };
}

export function parseVocabularyCards(text: string): VocabularyCard[] {
  const lines = normalizeLines(text);
  const cards: VocabularyCard[] = [];
  const pendingKorean: PendingKorean[] = [];

  lines.forEach((line, index) => {
    const inlinePair = parseInlinePair(line);

    if (inlinePair) {
      cards.push(createCard(inlinePair.korean, inlinePair.japanese, cards.length));
      return;
    }

    const koreanWords = extractKoreanWords(line);
    const japaneseText = extractJapaneseText(line);

    if (koreanWords.length > 0 && !japaneseText) {
      koreanWords.forEach((word) => pendingKorean.push({ text: word, index }));
      return;
    }

    if (japaneseText && pendingKorean.length > 0) {
      const korean = pendingKorean.shift();
      if (korean && index - korean.index <= 4) {
        cards.push(createCard(korean.text, japaneseText, cards.length));
      }
    }
  });

  return dedupeCards(cards).slice(0, 80);
}

function normalizeLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 0)
    .filter((line) => !/^\d+$/.test(line));
}

function parseInlinePair(line: string): { korean: string; japanese: string } | null {
  const koreanWords = extractKoreanWords(line);
  const japaneseText = extractJapaneseText(line);

  if (koreanWords.length === 0 || !japaneseText) {
    return null;
  }

  return {
    korean: koreanWords[0],
    japanese: japaneseText,
  };
}

function extractKoreanWords(text: string): string[] {
  return Array.from(text.matchAll(/[가-힣][가-힣\s]{0,18}[가-힣]/g))
    .map((match) => cleanKorean(match[0]))
    .filter((word) => word.length > 0 && word.length <= 18);
}

function extractJapaneseText(text: string): string {
  const withoutKorean = text.replace(/[가-힣\s]+/g, ' ');
  const match = withoutKorean.match(/[ぁ-んァ-ン一-龯々ーA-Za-z0-9・（）()、。/\s]+/g);

  return cleanJapanese(match?.join(' ') ?? '');
}

function createCard(korean: string, japanese: string, index: number): VocabularyCard {
  return {
    id: `card-${index}-${korean}`,
    korean,
    japanese,
    reading: romanizeHangul(korean),
    example: `${korean}을/를 복습해요.`,
    note: 'OCRから作ったカードです。違う場合はOCRテキストを直して再生成してください。',
    confidence: 0.86,
  };
}

function dedupeCards(cards: VocabularyCard[]): VocabularyCard[] {
  const seen = new Set<string>();

  return cards.filter((card) => {
    const key = `${card.korean}:${card.japanese}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function cleanKorean(text: string): string {
  return text.replace(/[^\uAC00-\uD7A3\s]/g, '').replace(/\s+/g, ' ').trim();
}

function cleanJapanese(text: string): string {
  return text
    .replace(/[^\u3040-\u30FF\u3400-\u9FFF々ーA-Za-z0-9・（）()、。/\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function romanizeHangul(text: string): string {
  const known: Record<string, string> = {
    공항: 'gonghang',
    국제선: 'gukjeseon',
    여권: 'yeogwon',
    항공권: 'hanggonggwon',
    출국: 'chulguk',
    탑승구: 'tapseunggu',
    호텔: 'hotel',
    짐: 'jim',
    약국: 'yakguk',
    병원: 'byeongwon',
    은행: 'eunhaeng',
    우체국: 'ucheguk',
    화장실: 'hwajangsil',
    지하철: 'jihacheol',
    버스: 'beoseu',
    택시: 'taeksi',
  };

  if (known[text]) {
    return known[text];
  }

  return Array.from(text)
    .map(romanizeSyllable)
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
}

function romanizeSyllable(character: string): string {
  const code = character.charCodeAt(0);

  if (code < 0xac00 || code > 0xd7a3) {
    return character === ' ' ? ' ' : '';
  }

  const initial = [
    'g',
    'kk',
    'n',
    'd',
    'tt',
    'r',
    'm',
    'b',
    'pp',
    's',
    'ss',
    '',
    'j',
    'jj',
    'ch',
    'k',
    't',
    'p',
    'h',
  ];
  const medial = [
    'a',
    'ae',
    'ya',
    'yae',
    'eo',
    'e',
    'yeo',
    'ye',
    'o',
    'wa',
    'wae',
    'oe',
    'yo',
    'u',
    'wo',
    'we',
    'wi',
    'yu',
    'eu',
    'ui',
    'i',
  ];
  const final = [
    '',
    'k',
    'k',
    'ks',
    'n',
    'nj',
    'nh',
    't',
    'l',
    'lk',
    'lm',
    'lb',
    'ls',
    'lt',
    'lp',
    'lh',
    'm',
    'p',
    'ps',
    't',
    't',
    'ng',
    't',
    't',
    'k',
    't',
    'p',
    'h',
  ];

  const offset = code - 0xac00;
  const initialIndex = Math.floor(offset / 588);
  const medialIndex = Math.floor((offset % 588) / 28);
  const finalIndex = offset % 28;

  return `${initial[initialIndex]}${medial[medialIndex]}${final[finalIndex]}`;
}
