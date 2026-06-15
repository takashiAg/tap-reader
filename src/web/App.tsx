import {
  BookOpen,
  CheckCircle2,
  ImagePlus,
  Languages,
  Loader2,
  RefreshCcw,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { travelVocabularyDeck } from '../domain/vocabulary/sampleDeck';
import type { VocabularyCard, VocabularyDeck, VocabularyReviewMark } from '../domain/vocabulary/vocabulary';
import { extractVocabularyWithAi } from './ocr/aiVocabularyExtractor';
import { getOcrLanguagePreset, ocrLanguagePresets, type OcrLanguagePresetId } from './ocr/ocrLanguagePresets';
import { isSupportedImageFile, prepareImageFile } from './ocr/prepareImageFile';
import { extractVocabularyFromImage, type OcrProgress } from './ocr/tesseractVocabularyExtractor';
import { createDeckFromText } from './ocr/vocabularyTextParser';
import type { AppInstallPromptEvent } from './pwa';

type ReviewMarks = Record<string, VocabularyReviewMark>;

const initialProgress: OcrProgress = {
  label: '画像を入れるとOCRで単語カード化します',
  progress: 0,
};

export function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deck, setDeck] = useState<VocabularyDeck>(travelVocabularyDeck);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [marks, setMarks] = useState<ReviewMarks>({});
  const [isMeaningVisible, setIsMeaningVisible] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState<OcrProgress>(initialProgress);
  const [rawText, setRawText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [languagePresetId, setLanguagePresetId] = useState<OcrLanguagePresetId>('ko-ja');
  const [installPrompt, setInstallPrompt] = useState<AppInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as AppInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
  }, []);

  const selectedCard = deck.cards[selectedIndex] ?? deck.cards[0];
  const languagePreset = getOcrLanguagePreset(languagePresetId);
  const knownCount = useMemo(
    () => deck.cards.filter((card) => marks[card.id] === 'known').length,
    [deck.cards, marks],
  );
  const learningCount = useMemo(
    () => deck.cards.filter((card) => marks[card.id] === 'learning').length,
    [deck.cards, marks],
  );

  const importImage = async (file: File) => {
    if (!isSupportedImageFile(file)) {
      setProgress({ label: '画像ファイルを選んでください', progress: 0 });
      return;
    }

    try {
      setIsExtracting(true);
      setProgress({ label: '画像を読み込み中', progress: 0.02 });
      const preparedFile = await prepareImageFile(file);

      setImageUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }
        return URL.createObjectURL(preparedFile);
      });

      setProgress({ label: 'AIで教材レイアウトを解析中', progress: 0.18 });
      const result = await extractWithBestAvailableRecognizer(preparedFile, languagePreset, setProgress);
      setDeck(result.deck);
      setRawText(result.rawText);
      setSelectedIndex(0);
      setMarks({});
      setIsMeaningVisible(false);
      setProgress({
        label: `${result.deck.cards.length}枚の単語カードを作りました`,
        progress: 1,
      });
    } catch (error) {
      const message = normalizeErrorMessage(error) || 'OCRに失敗しました';
      setProgress({
        label: `${message}。OCRテキスト欄に手入力して再生成できます。`,
        progress: 0,
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const rebuildFromText = () => {
    const nextDeck = createDeckFromText(rawText, 'テキストから作成', languagePreset);
    setDeck(nextDeck);
    setSelectedIndex(0);
    setMarks({});
    setIsMeaningVisible(false);
    setProgress({ label: `${nextDeck.cards.length}枚の単語カードを作りました`, progress: 1 });
  };

  const nextCard = () => {
    setSelectedIndex((currentIndex) => (currentIndex + 1) % deck.cards.length);
    setIsMeaningVisible(false);
  };

  const previousCard = () => {
    setSelectedIndex((currentIndex) => (currentIndex - 1 + deck.cards.length) % deck.cards.length);
    setIsMeaningVisible(false);
  };

  const toggleMark = () => {
    if (!selectedCard) {
      return;
    }

    setMarks((currentMarks) => ({
      ...currentMarks,
      [selectedCard.id]: nextReviewMark(currentMarks[selectedCard.id] ?? 'unknown'),
    }));
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Tap Reader</p>
          <h1>韓国語単語デッキ</h1>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button" type="button" onClick={() => stopSpeech()}>
            <Volume2 size={18} />
            Stop
          </button>
          {installPrompt ? (
            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                void installPrompt.prompt().finally(() => setInstallPrompt(null));
              }}
            >
              <BookOpen size={18} />
              Install
            </button>
          ) : null}
          <button className="primary-button" type="button" onClick={() => fileInputRef.current?.click()}>
            <ImagePlus size={18} />
            画像を入れる
          </button>
        </div>
      </header>

      <section className="workspace">
        <section className="import-panel">
          <input
            ref={fileInputRef}
            accept="image/*,.heic,.heif"
            className="sr-only"
            type="file"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) {
                void importImage(file);
              }
              event.currentTarget.value = '';
            }}
          />

          <div className="language-panel" aria-label="OCR言語">
            {ocrLanguagePresets.map((preset) => (
              <button
                className={`language-chip ${preset.id === languagePresetId ? 'language-chip-active' : ''}`}
                key={preset.id}
                type="button"
                onClick={() => setLanguagePresetId(preset.id)}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div
            className={`drop-zone ${isDragging ? 'drop-zone-active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              const file = event.dataTransfer.files[0];
              if (file) {
                void importImage(file);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
          >
            {imageUrl ? (
              <img alt="取り込んだ教材" className="image-preview" src={imageUrl} />
            ) : (
              <div className="drop-empty">
                <ImagePlus size={30} />
                <span>教材画像をドラッグ&ドロップ</span>
              </div>
            )}
          </div>

          <div className="progress-block">
            <div className="progress-header">
              <span>{progress.label}</span>
              {isExtracting ? <Loader2 className="spin" size={18} /> : null}
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.round(progress.progress * 100)}%` }} />
            </div>
          </div>

          <label className="text-editor-label" htmlFor="ocr-text">
            OCRテキスト
          </label>
          <textarea
            id="ocr-text"
            className="ocr-textarea"
            placeholder={'例:\n공항\n空港\n여권\nパスポート'}
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
          />
          <button className="secondary-button" type="button" onClick={rebuildFromText}>
            <RefreshCcw size={17} />
            テキストから再生成
          </button>
        </section>

        <section className="study-panel">
          <div className="deck-header">
            <div>
              <p className="eyebrow">Review</p>
              <h2>{deck.title}</h2>
            </div>
            <div className="deck-stats">
              <span>{deck.cards.length} cards</span>
              <span>{knownCount} known</span>
              <span>{learningCount} learning</span>
            </div>
          </div>

          {selectedCard ? (
            <VocabularyReviewCard
              card={selectedCard}
              index={selectedIndex}
              isMeaningVisible={isMeaningVisible}
              mark={marks[selectedCard.id] ?? 'unknown'}
              total={deck.cards.length}
              onNext={nextCard}
              onPrevious={previousCard}
              onSpeakJapanese={() => speak(selectedCard.japanese, 'ja-JP', 0.92)}
              onSpeakTerm={() => speak(selectedCard.korean, languagePreset.speechLocale, 0.82)}
              onToggleMark={toggleMark}
              onToggleMeaning={() => setIsMeaningVisible((visible) => !visible)}
            />
          ) : (
            <div className="empty-panel">
              <BookOpen size={28} />
              <p>カードがありません。画像かOCRテキストから作成してください。</p>
            </div>
          )}

          <div className="card-grid" aria-label="単語カード一覧">
            {deck.cards.map((card, index) => (
              <button
                className={`mini-card ${index === selectedIndex ? 'mini-card-active' : ''}`}
                key={card.id}
                type="button"
                onClick={() => {
                  setSelectedIndex(index);
                  setIsMeaningVisible(false);
                }}
              >
                <span>{card.korean}</span>
                <small>{card.japanese}</small>
                <i className={`mark-dot mark-${marks[card.id] ?? 'unknown'}`} />
              </button>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

async function extractWithBestAvailableRecognizer(
  image: File,
  languagePreset: ReturnType<typeof getOcrLanguagePreset>,
  setProgress: (progress: OcrProgress) => void,
) {
  try {
    return await extractVocabularyWithAi(image, languagePreset);
  } catch {
    setProgress({ label: 'AIが使えないためブラウザOCRに切り替えます', progress: 0.22 });
    return extractVocabularyFromImage(image, languagePreset, setProgress);
  }
}

type VocabularyReviewCardProps = {
  card: VocabularyCard;
  index: number;
  isMeaningVisible: boolean;
  mark: VocabularyReviewMark;
  total: number;
  onNext: () => void;
  onPrevious: () => void;
  onSpeakJapanese: () => void;
  onSpeakTerm: () => void;
  onToggleMark: () => void;
  onToggleMeaning: () => void;
};

function VocabularyReviewCard({
  card,
  index,
  isMeaningVisible,
  mark,
  total,
  onNext,
  onPrevious,
  onSpeakJapanese,
  onSpeakTerm,
  onToggleMark,
  onToggleMeaning,
}: VocabularyReviewCardProps) {
  return (
    <div className="review-card">
      <div className="review-meta">
        <span>
          {index + 1} / {total}
        </span>
        <button className={`mark-button mark-${mark}`} type="button" onClick={onToggleMark}>
          <CheckCircle2 size={16} />
          {markLabel(mark)}
        </button>
      </div>

      <button className="word-face" type="button" onClick={onToggleMeaning}>
        <strong>{card.korean}</strong>
        {card.reading ? <span>{card.reading}</span> : null}
        {!isMeaningVisible ? <em>クリックで意味を見る</em> : null}
      </button>

      {isMeaningVisible ? (
        <div className="meaning-block">
          <span className="section-label">意味</span>
          <p className="meaning-text">{card.japanese}</p>
          {card.example ? (
            <>
              <span className="section-label">例文</span>
              <p>{card.example}</p>
            </>
          ) : null}
          {card.note ? <p className="note-text">{card.note}</p> : null}
        </div>
      ) : null}

      <div className="review-actions">
        <button className="icon-action" type="button" onClick={onPrevious} aria-label="前のカード">
          <RotateCcw size={18} />
        </button>
        <button className="primary-button" type="button" onClick={onSpeakTerm}>
          <Volume2 size={18} />
          単語
        </button>
        <button className="secondary-button" type="button" onClick={onSpeakJapanese}>
          <Languages size={18} />
          日本語
        </button>
        <button className="icon-action" type="button" onClick={onNext} aria-label="次のカード">
          <RefreshCcw size={18} />
        </button>
      </div>
    </div>
  );
}

function speak(text: string, lang: string, rate: number) {
  const normalized = text.trim();

  if (!normalized || !('speechSynthesis' in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(normalized);
  utterance.lang = lang;
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
}

function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function nextReviewMark(current: VocabularyReviewMark): VocabularyReviewMark {
  if (current === 'unknown') {
    return 'learning';
  }

  if (current === 'learning') {
    return 'known';
  }

  return 'unknown';
}

function markLabel(mark: VocabularyReviewMark): string {
  switch (mark) {
    case 'known':
      return '覚えた';
    case 'learning':
      return '復習中';
    case 'unknown':
      return '未確認';
  }
}

function normalizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return '';
  }
}
