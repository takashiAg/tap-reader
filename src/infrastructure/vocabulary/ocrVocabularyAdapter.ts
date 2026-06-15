import type { VocabularyExtractionPort } from '../../application/ports';
import type { RecognizedToken } from '../../domain/recognition/recognition';
import type { VocabularyCard } from '../../domain/vocabulary/vocabulary';
import { travelVocabularyDeck } from '../../domain/vocabulary/sampleDeck';
import { nativeVisionOcrAdapter } from '../ocr/nativeVisionOcrAdapter';

export const ocrVocabularyAdapter: VocabularyExtractionPort = {
  async extractDeckFromImage(imageUri) {
    const frames = await Promise.all([
      nativeVisionOcrAdapter.recognizeStillImage(imageUri, 'ko', 'word'),
      nativeVisionOcrAdapter.recognizeStillImage(imageUri, 'ja', 'word'),
    ]);
    const tokens = dedupeTokens(frames.flatMap((frame) => frame.tokens));
    const cards = pairVocabulary(tokens);

    if (cards.length === 0) {
      return {
        ...travelVocabularyDeck,
        id: `image-fallback-${Date.now()}`,
        title: '読み取りサンプル',
        createdAt: Date.now(),
      };
    }

    return {
      id: `image-${Date.now()}`,
      title: `画像から作成 ${cards.length}語`,
      source: 'image',
      cards,
      createdAt: Date.now(),
    };
  },
};

function dedupeTokens(tokens: RecognizedToken[]): RecognizedToken[] {
  const seen = new Set<string>();
  return tokens.filter((token) => {
    const key = `${token.text}-${token.bounds.x.toFixed(2)}-${token.bounds.y.toFixed(2)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function pairVocabulary(tokens: RecognizedToken[]): VocabularyCard[] {
  const koreanTokens = tokens
    .filter((token) => isKoreanWord(token.text))
    .sort((a, b) => a.bounds.y - b.bounds.y || a.bounds.x - b.bounds.x);
  const japaneseTokens = tokens
    .filter((token) => isJapaneseText(token.text))
    .sort((a, b) => a.bounds.y - b.bounds.y || a.bounds.x - b.bounds.x);

  const usedJapaneseIds = new Set<string>();

  return koreanTokens
    .map<VocabularyCard | null>((koreanToken, index) => {
      const japaneseToken = findNearestJapanese(koreanToken, japaneseTokens, usedJapaneseIds);
      if (!japaneseToken) {
        return null;
      }

      usedJapaneseIds.add(japaneseToken.id);

      return {
        id: `image-card-${index}-${koreanToken.text}`,
        korean: cleanKorean(koreanToken.text),
        japanese: cleanJapanese(japaneseToken.text),
        reading: romanizeHangul(cleanKorean(koreanToken.text)),
        example: `${cleanKorean(koreanToken.text)}을/를 사용해요.`,
        note: '画像OCRから作ったカードです。必要ならあとで編集できるようにします。',
        confidence: Math.min(koreanToken.confidence, japaneseToken.confidence),
      };
    })
    .filter((card): card is VocabularyCard => Boolean(card))
    .filter((card) => card.korean.length > 0 && card.japanese.length > 0)
    .slice(0, 60);
}

function findNearestJapanese(
  koreanToken: RecognizedToken,
  japaneseTokens: RecognizedToken[],
  usedIds: Set<string>,
): RecognizedToken | undefined {
  const centerX = koreanToken.bounds.x + koreanToken.bounds.width / 2;
  const centerY = koreanToken.bounds.y + koreanToken.bounds.height / 2;

  return japaneseTokens
    .filter((token) => !usedIds.has(token.id))
    .map((token) => {
      const tokenCenterX = token.bounds.x + token.bounds.width / 2;
      const tokenCenterY = token.bounds.y + token.bounds.height / 2;
      const horizontalDistance = Math.abs(tokenCenterX - centerX);
      const verticalDistance = Math.abs(tokenCenterY - centerY);
      const belowBonus = tokenCenterY >= centerY ? -0.08 : 0;
      const score = horizontalDistance * 1.4 + verticalDistance + belowBonus;
      return { token, score };
    })
    .filter(({ token }) => Math.abs((token.bounds.x + token.bounds.width / 2) - centerX) < 0.2)
    .sort((a, b) => a.score - b.score)[0]?.token;
}

function isKoreanWord(text: string): boolean {
  const normalized = cleanKorean(text);
  return /^[가-힣]{1,12}$/.test(normalized);
}

function isJapaneseText(text: string): boolean {
  const normalized = cleanJapanese(text);
  return /[ぁ-んァ-ン一-龯]/.test(normalized) && !/[가-힣]/.test(normalized);
}

function cleanKorean(text: string): string {
  return text.replace(/[^\uAC00-\uD7A3]/g, '').trim();
}

function cleanJapanese(text: string): string {
  return text.replace(/[^\u3040-\u30FF\u3400-\u9FFF々ーA-Za-z0-9・（）()]/g, '').trim();
}

function romanizeHangul(text: string): string {
  const map: Record<string, string> = {
    공항: 'gonghang',
    국제선: 'gukjeseon',
    여권: 'yeogwon',
    항공권: 'hanggonggwon',
    수하물검사: 'suhamul geomsa',
    출국: 'chulguk',
    탑승구: 'tapseunggu',
    호텔: 'hotel',
    짐: 'jim',
    약국: 'yakguk',
    병원: 'byeongwon',
    은행: 'eunhaeng',
    우체국: 'ucheguk',
  };

  return map[text] ?? '';
}
