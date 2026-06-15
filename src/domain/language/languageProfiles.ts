import type { LanguageId, LanguageProfile } from './language';

export const languageProfiles: LanguageProfile[] = [
  {
    id: 'ko',
    label: 'Korean',
    nativeName: '한국어',
    speechLocale: 'ko-KR',
    sampleText: '안녕하세요. 저는 한국어를 공부하고 있어요.',
    wordHint: 'Tap a Korean word to hear it.',
    characterHint: 'Tap a Hangul block to hear it.',
  },
  {
    id: 'ja',
    label: 'Japanese',
    nativeName: '日本語',
    speechLocale: 'ja-JP',
    sampleText: 'こんにちは。日本語を勉強しています。',
    wordHint: 'Tap a Japanese phrase to hear it.',
    characterHint: 'Tap a character to hear it.',
  },
  {
    id: 'en',
    label: 'English',
    nativeName: 'English',
    speechLocale: 'en-US',
    sampleText: 'Hello. I am studying with the camera reader.',
    wordHint: 'Tap an English word to hear it.',
    characterHint: 'Tap a letter group to hear it.',
  },
  {
    id: 'zh',
    label: 'Chinese',
    nativeName: '中文',
    speechLocale: 'zh-CN',
    sampleText: '你好。我正在学习中文。',
    wordHint: 'Tap a Chinese phrase to hear it.',
    characterHint: 'Tap a character to hear it.',
  },
];

export function getLanguageProfile(languageId: LanguageId): LanguageProfile {
  return languageProfiles.find((language) => language.id === languageId) ?? languageProfiles[0];
}
