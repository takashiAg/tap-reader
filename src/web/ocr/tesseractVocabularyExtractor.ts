import type { PSM as PsmType } from 'tesseract.js';

import type { VocabularyDeck } from '../../domain/vocabulary/vocabulary';
import type { OcrLanguagePreset } from './ocrLanguagePresets';
import { createDeckFromText } from './vocabularyTextParser';

export type OcrProgress = {
  label: string;
  progress: number;
};

export type ExtractedVocabularyDeck = {
  deck: VocabularyDeck;
  rawText: string;
};

export async function extractVocabularyFromImage(
  image: File,
  preset: OcrLanguagePreset,
  onProgress: (progress: OcrProgress) => void,
): Promise<ExtractedVocabularyDeck> {
  onProgress({ label: 'OCRエンジンを準備中', progress: 0.05 });

  const { createWorker, PSM } = await import('tesseract.js');
  const worker = await createWorker(preset.tesseractLanguages, 1, {
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@7.0.0',
    langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/worker.min.js',
    logger(message) {
      if ('progress' in message && typeof message.progress === 'number') {
        onProgress({
          label: statusLabel(message.status),
          progress: Math.max(0.05, Math.min(0.98, message.progress)),
        });
      }
    },
  });

  try {
    await worker.setParameters({
      preserve_interword_spaces: '1',
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK as PsmType,
    });

    onProgress({ label: '画像を読み取り中', progress: 0.3 });
    const result = await worker.recognize(image);
    const rawText = result.data.text.trim();

    onProgress({ label: '単語カードを作成中', progress: 0.95 });

    return {
      deck: createDeckFromText(rawText, '画像から作成', preset),
      rawText,
    };
  } finally {
    await worker.terminate();
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'loading tesseract core':
    case 'initializing tesseract':
    case 'loading language traineddata':
    case 'initializing api':
      return 'OCRエンジンを準備中';
    case 'recognizing text':
      return '画像を読み取り中';
    default:
      return 'OCR処理中';
  }
}
