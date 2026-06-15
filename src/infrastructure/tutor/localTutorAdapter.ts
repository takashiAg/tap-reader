import type { TutorPort } from '../../application/ports';
import type { TutorReply } from '../../domain/conversation/conversation';

export const localTutorAdapter: TutorPort = {
  async reply({ mode, currentPhrase, learnerText }) {
    const normalized = learnerText.trim();
    const createdAt = Date.now();

    if (!normalized) {
      return createReply(
        '何か一言入れてみましょう。日本語でも韓国語でも大丈夫です。',
        currentPhrase.korean,
        createdAt,
      );
    }

    if (mode === 'meaning') {
      return createReply(
        `この文は「${currentPhrase.japanese}」という意味です。\n\n日常会話ではそのまま使えます。似た形で言うなら「${variantFor(currentPhrase.korean)}」も自然です。`,
        currentPhrase.korean,
        createdAt,
      );
    }

    if (mode === 'pronunciation') {
      return createReply(
        `読みは ${currentPhrase.romanization} です。\n\nまずはゆっくり、単語ごとに区切って読んでみてください。読み終わったら、入力欄に聞き取られた文を入れて「発音チェック」を押せます。`,
        currentPhrase.korean,
        createdAt,
      );
    }

    return createReply(
      createConversationReply(normalized, currentPhrase.korean),
      currentPhrase.korean,
      createdAt,
    );
  },
};

function createReply(text: string, korean: string, createdAt: number): TutorReply {
  return {
    message: {
      id: `assistant-${createdAt}`,
      role: 'assistant',
      text,
      korean,
      createdAt,
    },
  };
}

function createConversationReply(learnerText: string, phrase: string): string {
  if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(learnerText)) {
    return `좋아요. 이렇게 이어서 말해볼 수 있어요.\n\n${phrase}\n\n日本語で言うと、今の返事は会話として自然です。次は理由を一言足してみましょう。`;
  }

  return `いいですね。韓国語ではこう返せます。\n\n${phrase}\n\nこの文を一度聞いて、まねして読んでみましょう。`;
}

function variantFor(korean: string): string {
  if (korean.includes('주세요')) {
    return korean.replace('주세요', '부탁해요');
  }

  if (korean.includes('좋아해요')) {
    return korean.replace('좋아해요', '자주 봐요');
  }

  return korean;
}
