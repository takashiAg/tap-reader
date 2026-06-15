import { NativeModule, requireNativeModule } from 'expo';

import type { TapReaderOcrFrame, TapReaderOcrLanguageId, TapReaderOcrMode } from './TapReaderOcr.types';

declare class TapReaderOcrModule extends NativeModule<{}> {
  recognizeImage(
    uri: string,
    languageId: TapReaderOcrLanguageId,
    mode: TapReaderOcrMode,
  ): Promise<TapReaderOcrFrame>;
}

export default requireNativeModule<TapReaderOcrModule>('TapReaderOcr');
