import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { vocabularyUiAdapter } from '../adapters/vocabularyUiAdapter';
import type {
  UiVocabularyCard,
  UiVocabularyDeck,
  UiVocabularyReviewMark,
} from '../ports/vocabularyPort';

type VocabularyDeckScreenProps = {
  onBack: () => void;
};

type ReviewMarks = Record<string, UiVocabularyReviewMark>;

export function VocabularyDeckScreen({ onBack }: VocabularyDeckScreenProps) {
  const vocabulary = vocabularyUiAdapter;
  const sampleDeck = useMemo(() => vocabulary.getSampleDeck(), [vocabulary]);
  const [deck, setDeck] = useState<UiVocabularyDeck>(sampleDeck);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMeaningVisible, setIsMeaningVisible] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [status, setStatus] = useState('画像を入れると単語カードにします');
  const [marks, setMarks] = useState<ReviewMarks>({});

  const selectedCard = deck.cards[selectedIndex] ?? deck.cards[0];
  const knownCount = deck.cards.filter((card) => marks[card.id] === 'known').length;
  const learningCount = deck.cards.filter((card) => marks[card.id] === 'learning').length;

  const handleImportImage = async () => {
    setIsImporting(true);
    setStatus('画像を選択中');

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
      });

      if (result.canceled) {
        setStatus('画像の選択をキャンセルしました');
        return;
      }

      setStatus('OCRで単語を読み取り中');
      const nextDeck = await vocabulary.extractDeckFromImage(result.assets[0].uri);
      setDeck(nextDeck);
      setSelectedIndex(0);
      setIsMeaningVisible(false);
      setMarks({});
      setStatus(`${nextDeck.cards.length}枚のカードを作りました`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '画像の読み取りに失敗しました';
      setStatus(message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleNext = () => {
    setSelectedIndex((currentIndex) => (currentIndex + 1) % deck.cards.length);
    setIsMeaningVisible(false);
  };

  const handlePrevious = () => {
    setSelectedIndex((currentIndex) => (currentIndex - 1 + deck.cards.length) % deck.cards.length);
    setIsMeaningVisible(false);
  };

  const handleToggleMark = () => {
    if (!selectedCard) {
      return;
    }

    setMarks((currentMarks) => ({
      ...currentMarks,
      [selectedCard.id]: vocabulary.getNextReviewMark(currentMarks[selectedCard.id] ?? 'unknown'),
    }));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable accessibilityLabel="Back" style={styles.iconButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </Pressable>
        <View style={styles.headerTextBlock}>
          <Text style={styles.title}>Word Deck</Text>
          <Text style={styles.subtitle}>画像から意味と読み方を復習</Text>
        </View>
        <Pressable
          accessibilityLabel="Import vocabulary image"
          style={styles.importIconButton}
          onPress={handleImportImage}
          disabled={isImporting}
        >
          {isImporting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Ionicons name="image-outline" size={22} color="#FFFFFF" />
          )}
        </Pressable>
      </View>

      <View style={styles.summary}>
        <View>
          <Text style={styles.deckTitle}>{deck.title}</Text>
          <Text style={styles.statusText}>{status}</Text>
        </View>
        <View style={styles.progressPills}>
          <Text style={styles.progressPill}>{knownCount} known</Text>
          <Text style={styles.progressPill}>{learningCount} learning</Text>
        </View>
      </View>

      {selectedCard ? (
        <View style={styles.cardStage}>
          <View style={styles.cardCounter}>
            <Text style={styles.cardCounterText}>
              {selectedIndex + 1} / {deck.cards.length}
            </Text>
            <Text style={styles.markText}>{markLabel(marks[selectedCard.id] ?? 'unknown')}</Text>
          </View>

          <Pressable style={styles.studyCard} onPress={() => setIsMeaningVisible((visible) => !visible)}>
            <Text style={styles.korean}>{selectedCard.korean}</Text>
            {selectedCard.reading ? <Text style={styles.reading}>{selectedCard.reading}</Text> : null}
            {isMeaningVisible ? (
              <View style={styles.meaningPanel}>
                <Text style={styles.meaningLabel}>意味</Text>
                <Text style={styles.japanese}>{selectedCard.japanese}</Text>
                {selectedCard.example ? (
                  <>
                    <Text style={styles.meaningLabel}>例文</Text>
                    <Text style={styles.example}>{selectedCard.example}</Text>
                  </>
                ) : null}
                {selectedCard.note ? <Text style={styles.note}>{selectedCard.note}</Text> : null}
              </View>
            ) : (
              <Text style={styles.tapHint}>タップで意味を見る</Text>
            )}
          </Pressable>

          <View style={styles.cardActions}>
            <Pressable style={styles.roundButton} onPress={handlePrevious}>
              <Ionicons name="chevron-back" size={22} color="#0F766E" />
            </Pressable>
            <Pressable style={styles.primaryAction} onPress={() => vocabulary.speakCard(selectedCard)}>
              <Ionicons name="volume-high-outline" size={20} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>読み上げ</Text>
            </Pressable>
            <Pressable style={styles.roundButton} onPress={handleNext}>
              <Ionicons name="chevron-forward" size={22} color="#0F766E" />
            </Pressable>
          </View>

          <View style={styles.secondaryActions}>
            <Pressable style={styles.secondaryAction} onPress={() => vocabulary.speakMeaning(selectedCard)}>
              <Ionicons name="language-outline" size={18} color="#0F766E" />
              <Text style={styles.secondaryActionText}>意味を聞く</Text>
            </Pressable>
            <Pressable style={styles.secondaryAction} onPress={handleToggleMark}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#0F766E" />
              <Text style={styles.secondaryActionText}>覚えた/まだ</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>カードがありません</Text>
          <Text style={styles.emptyText}>画像を取り込むか、サンプルを使って復習できます。</Text>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardList}>
        {deck.cards.map((card, index) => (
          <VocabularyChip
            key={card.id}
            active={index === selectedIndex}
            card={card}
            mark={marks[card.id] ?? 'unknown'}
            onPress={() => {
              setSelectedIndex(index);
              setIsMeaningVisible(false);
            }}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

type VocabularyChipProps = {
  active: boolean;
  card: UiVocabularyCard;
  mark: UiVocabularyReviewMark;
  onPress: () => void;
};

function VocabularyChip({ active, card, mark, onPress }: VocabularyChipProps) {
  return (
    <Pressable style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipKorean, active && styles.chipTextActive]}>{card.korean}</Text>
      <Text numberOfLines={1} style={[styles.chipJapanese, active && styles.chipTextActive]}>
        {card.japanese}
      </Text>
      <View style={[styles.markDot, mark === 'known' && styles.markDotKnown, mark === 'learning' && styles.markDotLearning]} />
    </Pressable>
  );
}

function markLabel(mark: UiVocabularyReviewMark): string {
  switch (mark) {
    case 'known':
      return '覚えた';
    case 'learning':
      return '復習中';
    case 'unknown':
      return '未確認';
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  importIconButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#0F766E',
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
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 16,
  },
  deckTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  statusText: {
    maxWidth: 230,
    color: '#64748B',
    fontSize: 13,
    marginTop: 3,
  },
  progressPills: {
    gap: 6,
    alignItems: 'flex-end',
  },
  progressPill: {
    overflow: 'hidden',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    color: '#0F766E',
    backgroundColor: '#CCFBF1',
    fontSize: 11,
    fontWeight: '800',
  },
  cardStage: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cardCounter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardCounterText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '800',
  },
  markText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '800',
  },
  studyCard: {
    minHeight: 300,
    justifyContent: 'center',
    gap: 12,
    borderRadius: 8,
    padding: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  korean: {
    color: '#0F172A',
    fontSize: 48,
    fontWeight: '900',
    textAlign: 'center',
  },
  reading: {
    color: '#0F766E',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  tapHint: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  meaningPanel: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 14,
  },
  meaningLabel: {
    color: '#0F766E',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  japanese: {
    color: '#0F172A',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  example: {
    color: '#334155',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  note: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 18,
  },
  roundButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#ECFEFF',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  primaryAction: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    paddingHorizontal: 24,
    backgroundColor: '#0F766E',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 8,
    backgroundColor: '#ECFEFF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  secondaryActionText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '800',
  },
  cardList: {
    gap: 10,
    padding: 16,
    paddingBottom: 18,
  },
  chip: {
    width: 126,
    minHeight: 86,
    justifyContent: 'center',
    gap: 4,
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  chipActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  chipKorean: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  chipJapanese: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  markDot: {
    position: 'absolute',
    right: 7,
    top: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CBD5E1',
  },
  markDotKnown: {
    backgroundColor: '#22C55E',
  },
  markDotLearning: {
    backgroundColor: '#FACC15',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
});
