export type OcrLanguagePresetId = 'ko-ja' | 'ja' | 'en-ja' | 'zh-ja' | 'multi';

export type OcrLanguagePreset = {
  id: OcrLanguagePresetId;
  label: string;
  tesseractLanguages: string;
  speechLocale: string;
  termPattern: RegExp;
};

export const ocrLanguagePresets: OcrLanguagePreset[] = [
  {
    id: 'ko-ja',
    label: '韓国語 + 日本語',
    tesseractLanguages: 'kor+jpn',
    speechLocale: 'ko-KR',
    termPattern: /[가-힣][가-힣\s]{0,18}[가-힣]/g,
  },
  {
    id: 'ja',
    label: '日本語',
    tesseractLanguages: 'jpn',
    speechLocale: 'ja-JP',
    termPattern: /[ぁ-んァ-ン一-龯々ー][ぁ-んァ-ン一-龯々ー\s]{0,24}/g,
  },
  {
    id: 'en-ja',
    label: '英語 + 日本語',
    tesseractLanguages: 'eng+jpn',
    speechLocale: 'en-US',
    termPattern: /[A-Za-z][A-Za-z\s'-]{1,32}/g,
  },
  {
    id: 'zh-ja',
    label: '中国語 + 日本語',
    tesseractLanguages: 'chi_sim+jpn',
    speechLocale: 'zh-CN',
    termPattern: /[\u3400-\u9FFF][\u3400-\u9FFF\s]{0,18}/g,
  },
  {
    id: 'multi',
    label: '多言語',
    tesseractLanguages: 'kor+jpn+eng+chi_sim',
    speechLocale: 'ko-KR',
    termPattern: /[가-힣][가-힣\s]{0,18}[가-힣]|[A-Za-z][A-Za-z\s'-]{1,32}|[\u3400-\u9FFF][\u3400-\u9FFF\s]{0,18}/g,
  },
];

export function getOcrLanguagePreset(id: OcrLanguagePresetId): OcrLanguagePreset {
  return ocrLanguagePresets.find((preset) => preset.id === id) ?? ocrLanguagePresets[0];
}
