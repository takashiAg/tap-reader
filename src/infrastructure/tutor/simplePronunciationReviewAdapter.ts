import type { PronunciationReviewPort } from '../../application/ports';
import type { PracticePhrase, PronunciationReview } from '../../domain/conversation/conversation';

export const simplePronunciationReviewAdapter: PronunciationReviewPort = {
  review(expected, transcript) {
    const expectedWords = tokenizeKorean(expected.korean);
    const transcriptWords = tokenizeKorean(transcript);
    const transcriptSet = new Set(transcriptWords);
    const expectedSet = new Set(expectedWords);
    const missedWords = expectedWords.filter((word) => !transcriptSet.has(word));
    const extraWords = transcriptWords.filter((word) => !expectedSet.has(word));
    const matchedCount = expectedWords.filter((word) => transcriptSet.has(word)).length;
    const score = expectedWords.length === 0 ? 0 : Math.round((matchedCount / expectedWords.length) * 100);

    return {
      expected: expected.korean,
      transcript,
      score,
      summary: createSummary(score, missedWords),
      missedWords,
      extraWords,
      tips: createTips(expected, missedWords, extraWords),
    } satisfies PronunciationReview;
  },
};

function tokenizeKorean(text: string): string[] {
  return text
    .replace(/[.,!?。！？]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

function createSummary(score: number, missedWords: string[]): string {
  if (score >= 90) {
    return 'かなり自然に読めています。次は少し速めに会話っぽく読んでみましょう。';
  }

  if (score >= 65) {
    return `だいたい伝わっています。${missedWords.slice(0, 2).join(' / ')} の部分をもう一度ゆっくり確認しましょう。`;
  }

  return 'まだ認識結果との差があります。短く区切って、一語ずつ読んでみましょう。';
}

function createTips(expected: PracticePhrase, missedWords: string[], extraWords: string[]): string[] {
  const tips = [
    expected.hint,
    `読み方: ${expected.romanization}`,
  ];

  if (missedWords.length > 0) {
    tips.push(`聞き取れなかったかも: ${missedWords.join(' / ')}`);
  }

  if (extraWords.length > 0) {
    tips.push(`余分に聞こえたかも: ${extraWords.join(' / ')}`);
  }

  return tips;
}
