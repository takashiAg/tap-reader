export type TapReaderOcrMode = 'word' | 'character';

export type TapReaderOcrLanguageId = 'ko' | 'ja' | 'en' | 'zh';

export type TapReaderOcrToken = {
  id: string;
  text: string;
  reading?: string;
  meaning?: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
};

export type TapReaderOcrFrame = {
  languageId: TapReaderOcrLanguageId;
  mode: TapReaderOcrMode;
  capturedAt: number;
  tokens: TapReaderOcrToken[];
};
