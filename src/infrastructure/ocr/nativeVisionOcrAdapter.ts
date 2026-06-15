import type {
  TapReaderOcrFrame,
  TapReaderOcrLanguageId,
  TapReaderOcrMode,
} from '../../../modules/tap-reader-ocr/src/TapReaderOcr.types';
import type { OcrPort } from '../../application/ports';
import type { LanguageId } from '../../domain/language/language';
import type { RecognitionFrame, RecognitionMode } from '../../domain/recognition/recognition';
import { mockOcrAdapter } from './mockOcrAdapter';

type NativeOcrModule = {
  recognizeImage(
    uri: string,
    languageId: TapReaderOcrLanguageId,
    mode: TapReaderOcrMode,
  ): Promise<TapReaderOcrFrame>;
};

export const nativeVisionOcrAdapter: OcrPort = {
  recognizeLiveFrame(languageId, mode, step) {
    return mockOcrAdapter.recognizeLiveFrame(languageId, mode, step);
  },

  async recognizeStillImage(imageUri, languageId, mode) {
    const nativeModule = await getNativeOcrModule();

    if (!nativeModule) {
      return mockOcrAdapter.recognizeStillImage(imageUri, languageId, mode);
    }

    const frame = await nativeModule.recognizeImage(imageUri, toNativeLanguageId(languageId), toNativeMode(mode));
    return toRecognitionFrame(frame);
  },
};

async function getNativeOcrModule(): Promise<NativeOcrModule | null> {
  try {
    const moduleExports = await import('../../../modules/tap-reader-ocr/src/TapReaderOcrModule');
    return moduleExports.default as NativeOcrModule;
  } catch {
    return null;
  }
}

function toNativeLanguageId(languageId: LanguageId): TapReaderOcrLanguageId {
  return languageId;
}

function toNativeMode(mode: RecognitionMode): TapReaderOcrMode {
  return mode;
}

function toRecognitionFrame(frame: TapReaderOcrFrame): RecognitionFrame {
  return {
    languageId: frame.languageId,
    mode: frame.mode,
    capturedAt: frame.capturedAt,
    tokens: frame.tokens,
  };
}
