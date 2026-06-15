import type { PracticePhrase } from './conversation';

export const practicePhrases: PracticePhrase[] = [
  {
    id: 'intro-study',
    korean: '안녕하세요. 저는 한국어를 공부하고 있어요.',
    japanese: 'こんにちは。私は韓国語を勉強しています。',
    romanization: 'annyeonghaseyo. jeoneun hangugeoreul gongbuhago isseoyo.',
    hint: '처음 인사할 때 자연스러운 문장이에요. 저는 を少し短く、공부하고 있어요 は流れで読みます。',
    level: 'beginner',
  },
  {
    id: 'cafe-order',
    korean: '아이스 아메리카노 하나 주세요.',
    japanese: 'アイスアメリカーノを1つください。',
    romanization: 'aiseu amerikano hana juseyo.',
    hint: '注文でよく使います。주세요 は「ください」で、語尾をやわらかく下げます。',
    level: 'beginner',
  },
  {
    id: 'daily-question',
    korean: '오늘 뭐 했어요?',
    japanese: '今日は何をしましたか？',
    romanization: 'oneul mwo haesseoyo?',
    hint: '会話の入口に便利です。뭐 は短く、했어요 は hae-sseo-yo のリズムです。',
    level: 'casual',
  },
  {
    id: 'like-korean',
    korean: '저는 한국 드라마를 좋아해요.',
    japanese: '私は韓国ドラマが好きです。',
    romanization: 'jeoneun hanguk deuramareul joahaeyo.',
    hint: '좋아해요 は「好きです」。ㅎが弱く聞こえることがあります。',
    level: 'beginner',
  },
];

export function getPracticePhrase(index: number): PracticePhrase {
  return practicePhrases[index % practicePhrases.length];
}
