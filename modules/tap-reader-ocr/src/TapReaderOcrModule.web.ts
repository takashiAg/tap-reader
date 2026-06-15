import type { TapReaderOcrFrame, TapReaderOcrLanguageId, TapReaderOcrMode } from './TapReaderOcr.types';

export default {
  async recognizeImage(
    _uri: string,
    languageId: TapReaderOcrLanguageId,
    mode: TapReaderOcrMode,
  ): Promise<TapReaderOcrFrame> {
    return {
      languageId,
      mode,
      capturedAt: Date.now(),
      tokens: [],
    };
  },
};
