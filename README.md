# tap-reader

韓国語の教材画像から単語カードを作って、意味と読み方を復習する React Web/PWA アプリです。

## What Works

- PC / mobile browser対応のReact Webアプリ
- 教材画像のドラッグ&ドロップ / ファイル選択
- Gemini Vision による教材レイアウト認識
- APIキーがない場合の `tesseract.js` ブラウザ内OCR fallback
- 日本語 / 韓国語 / 英語 / 中国語 / 多言語のOCRプリセット
- HEIC / HEIF 画像のJPEG変換
- OCRテキストの手修正とカード再生成
- 韓国語/日本語の読み上げ
- 覚えた / 復習中 / 未確認の簡易レビュー
- PWA manifest と service worker

## Run

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

AI認識を使う場合は `.env` に Gemini API key を設定します。

```bash
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3.5-flash
```

`GEMINI_API_KEY` がない場合、画像認識はブラウザ内OCRへ自動で切り替わります。

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Notes

ブラウザ内OCRの初回実行時は、Tesseractのworkerと言語データを取得するためネットワークが必要です。一度取得できたリソースはservice workerのキャッシュ対象になります。
