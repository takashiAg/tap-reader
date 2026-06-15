import type { VocabularyDeck } from '../../domain/vocabulary/vocabulary';
import type { OcrLanguagePreset } from './ocrLanguagePresets';

export type AiVocabularyExtractionResult = {
  deck: VocabularyDeck;
  rawText: string;
};

export async function extractVocabularyWithAi(
  image: File,
  preset: OcrLanguagePreset,
): Promise<AiVocabularyExtractionResult> {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('presetLabel', preset.label);

  const response = await fetch('/api/extract-vocabulary', {
    body: formData,
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error ?? `AI認識に失敗しました (${response.status})`);
  }

  const data = (await response.json()) as {
    cards: Array<{
      confidence: number;
      example?: string;
      id: string;
      japanese: string;
      korean: string;
      note?: string;
      reading?: string;
    }>;
    rawText: string;
  };

  return {
    deck: {
      cards: data.cards,
      createdAt: Date.now(),
      id: `ai-${Date.now()}`,
      source: 'image',
      title: `AI認識 ${data.cards.length}語`,
    },
    rawText: data.rawText,
  };
}
