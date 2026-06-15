import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { tutorUiAdapter } from '../adapters/tutorUiAdapter';
import type {
  UiPracticePhrase,
  UiPronunciationReview,
  UiTutorMessage,
  UiTutorMode,
} from '../ports/tutorPort';

type TutorConversationScreenProps = {
  onOpenCamera: () => void;
};

export function TutorConversationScreen({ onOpenCamera }: TutorConversationScreenProps) {
  const tutor = tutorUiAdapter;
  const initialPhrase = useMemo(() => tutor.getInitialPhrase(), [tutor]);
  const initialMessages = useMemo(() => tutor.getInitialMessages(initialPhrase), [initialPhrase, tutor]);
  const scrollRef = useRef<ScrollView>(null);
  const [phrase, setPhrase] = useState<UiPracticePhrase>(initialPhrase);
  const [messages, setMessages] = useState<UiTutorMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(initialMessages[0]?.id ?? null);
  const [review, setReview] = useState<UiPronunciationReview | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const appendMessage = (message: UiTutorMessage) => {
    setMessages((currentMessages) => [...currentMessages, message]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  const handleAskTutor = async (mode: UiTutorMode, overrideText?: string) => {
    const learnerText = (overrideText ?? inputText).trim();
    if (!learnerText && mode === 'conversation') {
      return;
    }

    setInputText('');
    setReview(null);
    const learnerMessage: UiTutorMessage = {
      id: `learner-${Date.now()}`,
      role: 'learner',
      text: learnerText || modeLabel(mode),
      korean: containsKorean(learnerText) ? learnerText : undefined,
      createdAt: Date.now(),
    };

    appendMessage(learnerMessage);
    setIsThinking(true);

    try {
      const assistantMessage = await tutor.askTutor({
        mode,
        currentPhrase: phrase,
        messages: [...messages, learnerMessage],
        learnerText,
      });
      appendMessage(assistantMessage);
      setExpandedMessageId(assistantMessage.id);
    } finally {
      setIsThinking(false);
    }
  };

  const handleReview = () => {
    const transcript = inputText.trim();
    if (!transcript) {
      return;
    }

    const nextReview = tutor.reviewPronunciation(phrase, transcript);
    setReview(nextReview);
    setInputText('');
    appendMessage({
      id: `learner-${Date.now()}`,
      role: 'learner',
      text: transcript,
      korean: transcript,
      createdAt: Date.now(),
    });
    appendMessage({
      id: `assistant-${Date.now() + 1}`,
      role: 'assistant',
      text: `発音チェック: ${nextReview.score}点\n${nextReview.summary}`,
      korean: phrase.korean,
      createdAt: Date.now() + 1,
    });
  };

  const handleNextPhrase = () => {
    const nextPhrase = tutor.getNextPhrase(phrase.id);
    setPhrase(nextPhrase);
    setReview(null);
    const assistantMessage: UiTutorMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      text: `次はこのフレーズです。タップして意味と読みを確認できます。\n\n${nextPhrase.korean}`,
      korean: nextPhrase.korean,
      createdAt: Date.now(),
    };
    appendMessage(assistantMessage);
    setExpandedMessageId(assistantMessage.id);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardRoot}
      >
        <View style={styles.header}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>Korean Tutor</Text>
            <Text style={styles.subtitle}>会話しながら、読み方を少しずつ直す</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable accessibilityLabel="Stop speech" style={styles.iconButton} onPress={tutor.stopSpeech}>
              <Ionicons name="volume-mute-outline" size={20} color="#0F172A" />
            </Pressable>
            <Pressable accessibilityLabel="Open camera reader" style={styles.iconButton} onPress={onOpenCamera}>
              <Ionicons name="camera-outline" size={20} color="#0F172A" />
            </Pressable>
          </View>
        </View>

        <View style={styles.phrasePanel}>
          <View style={styles.phraseHeader}>
            <Text style={styles.panelLabel}>Today phrase</Text>
            <Pressable style={styles.nextButton} onPress={handleNextPhrase}>
              <Ionicons name="shuffle-outline" size={16} color="#0F766E" />
              <Text style={styles.nextButtonText}>Next</Text>
            </Pressable>
          </View>
          <Pressable style={styles.phraseCard} onPress={() => tutor.speakKorean(phrase.korean)}>
            <Text style={styles.phraseKorean}>{phrase.korean}</Text>
            <Text style={styles.phraseJapanese}>{phrase.japanese}</Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              expanded={expandedMessageId === message.id}
              message={message}
              phrase={phrase}
              onToggle={() => setExpandedMessageId(expandedMessageId === message.id ? null : message.id)}
              onSpeakJapanese={tutor.speakJapanese}
              onSpeakKorean={tutor.speakKorean}
            />
          ))}
          {review ? <ReviewCard review={review} /> : null}
          {isThinking ? (
            <View style={styles.thinkingRow}>
              <ActivityIndicator color="#0F766E" />
              <Text style={styles.thinkingText}>考え中</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.quickRow}>
          <QuickAction icon="language-outline" label="意味" onPress={() => handleAskTutor('meaning', '意味を教えて')} />
          <QuickAction icon="mic-outline" label="読み方" onPress={() => handleAskTutor('pronunciation', '読み方を教えて')} />
          <QuickAction icon="play-outline" label="お手本" onPress={() => tutor.speakKorean(phrase.korean, 0.78)} />
          <QuickAction icon="checkmark-circle-outline" label="発音チェック" onPress={handleReview} />
        </View>

        <View style={styles.composer}>
          <TextInput
            multiline
            placeholder="日本語で質問 / 韓国語で返答 / STT結果を入力"
            placeholderTextColor="#64748B"
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
          />
          <Pressable
            accessibilityLabel="Send message"
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            disabled={!inputText.trim() || isThinking}
            onPress={() => handleAskTutor('conversation')}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type MessageBubbleProps = {
  expanded: boolean;
  message: UiTutorMessage;
  phrase: UiPracticePhrase;
  onSpeakJapanese: (text: string) => void;
  onSpeakKorean: (text: string, rate?: number) => void;
  onToggle: () => void;
};

function MessageBubble({
  expanded,
  message,
  phrase,
  onSpeakJapanese,
  onSpeakKorean,
  onToggle,
}: MessageBubbleProps) {
  const isLearner = message.role === 'learner';
  const koreanText = message.korean ?? extractKorean(message.text);
  const hasKorean = Boolean(koreanText);
  const speakableKorean = koreanText ?? '';

  return (
    <View style={[styles.messageRow, isLearner && styles.messageRowLearner]}>
      <Pressable
        disabled={!hasKorean}
        style={[styles.bubble, isLearner ? styles.learnerBubble : styles.assistantBubble]}
        onPress={hasKorean ? onToggle : undefined}
      >
        <Text style={[styles.messageText, isLearner && styles.learnerMessageText]}>{message.text}</Text>
        {hasKorean ? (
          <View style={styles.bubbleActions}>
            <Pressable style={styles.smallIconButton} onPress={() => onSpeakKorean(speakableKorean, 0.82)}>
              <Ionicons name="volume-high-outline" size={16} color={isLearner ? '#E0F2FE' : '#0F766E'} />
            </Pressable>
            <Text style={[styles.tapHint, isLearner && styles.learnerTapHint]}>
              {expanded ? '閉じる' : '意味を見る'}
            </Text>
          </View>
        ) : null}
        {expanded && hasKorean ? (
          <View style={styles.translationPanel}>
            <Text style={styles.translationLabel}>日本語</Text>
            <Text style={styles.translationText}>{phrase.japanese}</Text>
            <Text style={styles.translationLabel}>読み</Text>
            <Text style={styles.translationText}>{phrase.romanization}</Text>
            <Text style={styles.translationLabel}>ヒント</Text>
            <Text style={styles.translationText}>{phrase.hint}</Text>
            <Pressable style={styles.listenJapaneseButton} onPress={() => onSpeakJapanese(phrase.japanese)}>
              <Ionicons name="volume-medium-outline" size={15} color="#0F766E" />
              <Text style={styles.listenJapaneseText}>日本語も聞く</Text>
            </Pressable>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

function ReviewCard({ review }: { review: UiPronunciationReview }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewScore}>{review.score}</Text>
        <Text style={styles.reviewScoreLabel}>score</Text>
      </View>
      <Text style={styles.reviewSummary}>{review.summary}</Text>
      {review.tips.map((tip) => (
        <Text key={tip} style={styles.reviewTip}>
          {tip}
        </Text>
      ))}
    </View>
  );
}

type QuickActionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

function QuickAction({ icon, label, onPress }: QuickActionProps) {
  return (
    <Pressable style={styles.quickButton} onPress={onPress}>
      <Ionicons name={icon} size={17} color="#0F766E" />
      <Text style={styles.quickButtonText}>{label}</Text>
    </Pressable>
  );
}

function containsKorean(text: string): boolean {
  return /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(text);
}

function extractKorean(text: string): string | undefined {
  const match = text.match(/[ㄱ-ㅎㅏ-ㅣ가-힣][ㄱ-ㅎㅏ-ㅣ가-힣\s.,!?。！？]+/);
  return match?.[0]?.trim();
}

function modeLabel(mode: UiTutorMode): string {
  switch (mode) {
    case 'meaning':
      return '意味を教えて';
    case 'pronunciation':
      return '読み方を教えて';
    case 'conversation':
      return '会話練習';
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardRoot: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTextBlock: {
    flex: 1,
  },
  title: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#475569',
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  phrasePanel: {
    padding: 14,
    gap: 8,
    backgroundColor: '#ECFEFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CFFAFE',
  },
  phraseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelLabel: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  nextButton: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  nextButtonText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '800',
  },
  phraseCard: {
    gap: 5,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  phraseKorean: {
    color: '#0F172A',
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 29,
  },
  phraseJapanese: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  messages: {
    gap: 10,
    padding: 14,
    paddingBottom: 18,
  },
  messageRow: {
    flexDirection: 'row',
  },
  messageRowLearner: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '86%',
    borderRadius: 8,
    padding: 12,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  learnerBubble: {
    backgroundColor: '#0F766E',
  },
  messageText: {
    color: '#0F172A',
    fontSize: 15,
    lineHeight: 22,
  },
  learnerMessageText: {
    color: '#FFFFFF',
  },
  bubbleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  smallIconButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(15, 118, 110, 0.12)',
  },
  tapHint: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '800',
  },
  learnerTapHint: {
    color: '#CCFBF1',
  },
  translationPanel: {
    gap: 4,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    paddingTop: 10,
  },
  translationLabel: {
    color: '#0F766E',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  translationText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 19,
  },
  listenJapaneseButton: {
    alignSelf: 'flex-start',
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    paddingHorizontal: 9,
    backgroundColor: '#CCFBF1',
  },
  listenJapaneseText: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '800',
  },
  reviewCard: {
    gap: 7,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  reviewScore: {
    color: '#92400E',
    fontSize: 30,
    fontWeight: '900',
  },
  reviewScoreLabel: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  reviewSummary: {
    color: '#78350F',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  reviewTip: {
    color: '#92400E',
    fontSize: 13,
    lineHeight: 19,
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 6,
  },
  thinkingText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  quickButton: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: 8,
    backgroundColor: '#ECFEFF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  quickButtonText: {
    color: '#0F766E',
    fontSize: 11,
    fontWeight: '800',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  input: {
    flex: 1,
    maxHeight: 98,
    minHeight: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    fontSize: 15,
    lineHeight: 20,
  },
  sendButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#0F766E',
  },
  sendButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
});
