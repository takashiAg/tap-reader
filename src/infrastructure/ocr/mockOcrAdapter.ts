import { getLanguageProfile } from '../../domain/language/languageProfiles';
import type { LanguageId } from '../../domain/language/language';
import type {
  RecognitionFrame,
  RecognitionMode,
  RecognizedToken,
} from '../../domain/recognition/recognition';
import type { OcrPort } from '../../application/ports';

const sampleWords: Record<LanguageId, Array<Omit<RecognizedToken, 'id'>>> = {
  ko: [
    {
      text: '안녕하세요',
      reading: 'annyeonghaseyo',
      meaning: 'hello',
      bounds: { x: 0.16, y: 0.28, width: 0.46, height: 0.08 },
      confidence: 0.96,
    },
    {
      text: '저는',
      reading: 'jeoneun',
      meaning: 'I am',
      bounds: { x: 0.2, y: 0.4, width: 0.2, height: 0.07 },
      confidence: 0.94,
    },
    {
      text: '한국어를',
      reading: 'hangugeoreul',
      meaning: 'Korean language',
      bounds: { x: 0.44, y: 0.4, width: 0.32, height: 0.07 },
      confidence: 0.93,
    },
    {
      text: '공부해요',
      reading: 'gongbuhaeyo',
      meaning: 'study',
      bounds: { x: 0.26, y: 0.52, width: 0.34, height: 0.075 },
      confidence: 0.95,
    },
  ],
  ja: [
    {
      text: 'こんにちは',
      reading: 'konnichiwa',
      meaning: 'hello',
      bounds: { x: 0.17, y: 0.31, width: 0.42, height: 0.075 },
      confidence: 0.95,
    },
    {
      text: '日本語',
      reading: 'にほんご',
      meaning: 'Japanese',
      bounds: { x: 0.2, y: 0.43, width: 0.26, height: 0.075 },
      confidence: 0.93,
    },
    {
      text: '勉強しています',
      reading: 'べんきょうしています',
      meaning: 'am studying',
      bounds: { x: 0.48, y: 0.43, width: 0.37, height: 0.075 },
      confidence: 0.92,
    },
  ],
  en: [
    {
      text: 'Hello',
      reading: 'hello',
      meaning: 'greeting',
      bounds: { x: 0.18, y: 0.3, width: 0.22, height: 0.07 },
      confidence: 0.97,
    },
    {
      text: 'camera',
      reading: 'camera',
      meaning: 'camera',
      bounds: { x: 0.42, y: 0.3, width: 0.28, height: 0.07 },
      confidence: 0.96,
    },
    {
      text: 'reader',
      reading: 'reader',
      meaning: 'reader',
      bounds: { x: 0.28, y: 0.42, width: 0.29, height: 0.07 },
      confidence: 0.96,
    },
  ],
  zh: [
    {
      text: '你好',
      reading: 'ni hao',
      meaning: 'hello',
      bounds: { x: 0.19, y: 0.31, width: 0.2, height: 0.075 },
      confidence: 0.95,
    },
    {
      text: '学习',
      reading: 'xue xi',
      meaning: 'study',
      bounds: { x: 0.42, y: 0.31, width: 0.2, height: 0.075 },
      confidence: 0.92,
    },
    {
      text: '中文',
      reading: 'zhong wen',
      meaning: 'Chinese',
      bounds: { x: 0.3, y: 0.43, width: 0.2, height: 0.075 },
      confidence: 0.94,
    },
  ],
};

export const mockOcrAdapter: OcrPort = {
  recognizeLiveFrame(languageId, mode, step) {
    return getMockRecognitionFrame(languageId, mode, step);
  },

  async recognizeStillImage(_imageUri, languageId, mode) {
    return getSampleFrame(languageId, mode);
  },
};

function getMockRecognitionFrame(
  languageId: LanguageId,
  mode: RecognitionMode,
  step: number,
): RecognitionFrame {
  const words = sampleWords[languageId];
  const activeCount = Math.max(1, Math.min(words.length, (step % (words.length + 1)) || words.length));
  const activeWords = words.slice(0, activeCount);

  const tokens =
    mode === 'character'
      ? activeWords.flatMap((word, wordIndex) => splitIntoCharacterTokens(word, wordIndex))
      : activeWords.map((word, index) => ({
          ...word,
          id: `${languageId}-word-${index}-${word.text}`,
        }));

  return {
    languageId,
    mode,
    tokens,
    capturedAt: Date.now(),
  };
}

function getSampleFrame(languageId: LanguageId, mode: RecognitionMode): RecognitionFrame {
  const language = getLanguageProfile(languageId);
  const tokens = language.sampleText
    .split(/\s+/)
    .filter(Boolean)
    .map((text, index) => ({
      id: `${languageId}-sample-${index}`,
      text,
      reading: text,
      bounds: {
        x: 0.14 + (index % 2) * 0.34,
        y: 0.3 + Math.floor(index / 2) * 0.12,
        width: 0.3,
        height: 0.075,
      },
      confidence: 0.9,
    }));

  return {
    languageId,
    mode,
    tokens,
    capturedAt: Date.now(),
  };
}

function splitIntoCharacterTokens(
  word: Omit<RecognizedToken, 'id'>,
  wordIndex: number,
): RecognizedToken[] {
  const characters = Array.from(word.text);
  const width = word.bounds.width / characters.length;

  return characters.map((character, characterIndex) => ({
    id: `char-${wordIndex}-${characterIndex}-${character}`,
    text: character,
    reading: character,
    meaning: word.meaning,
    bounds: {
      x: word.bounds.x + width * characterIndex,
      y: word.bounds.y,
      width: Math.max(width - 0.006, 0.04),
      height: word.bounds.height,
    },
    confidence: word.confidence,
  }));
}
