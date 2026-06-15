# tap-reader

韓国語の教材画像から単語カードを作って、意味と読み方を復習する React Web/PWA アプリです。

## What Works

- PC / mobile browser対応のReact Webアプリ
- 教材画像のドラッグ&ドロップ / ファイル選択
- `tesseract.js` によるブラウザ内OCR
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

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Notes

OCRの初回実行時は、Tesseractのworkerと言語データを取得するためネットワークが必要です。一度取得できたリソースはservice workerのキャッシュ対象になります。
