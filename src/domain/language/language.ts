export type LanguageId = 'ko' | 'ja' | 'en' | 'zh';

export type LanguageProfile = {
  id: LanguageId;
  label: string;
  nativeName: string;
  speechLocale: string;
  sampleText: string;
  wordHint: string;
  characterHint: string;
};
