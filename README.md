# tap-reader

Multilingual camera reader prototype for iOS built with Expo and React Native.

## What works now

- Live camera screen with tappable OCR overlays
- Word and character tap modes
- Language profiles for Korean, Japanese, English, and Chinese
- Text-to-speech playback through Expo Speech
- Photo import flow with the same recognition result contract
- iOS on-device OCR through a local Expo native module backed by Apple Vision
- DDD-style layering with UI ports/adapters

## Architecture

```text
src/domain
  language/       Language profiles and ids
  recognition/    OCR result entities

src/application
  ports.ts         OCR and speech application ports
  readerUseCases.ts
  container.ts     Current dependency wiring

src/infrastructure
  ocr/             OCR adapters: Apple Vision with mock fallback
  speech/          Expo Speech adapter

src/ui
  ports/           UI-facing contracts
  adapters/        UI adapter from app use cases
  screens/         React Native screens
```

The UI depends on `src/ui/ports/liveReaderPort.ts`. It does not import domain entities or native OCR directly. Swap UI implementations without changing the application layer as long as the UI port contract is honored.

The OCR adapter uses the local native module in `modules/tap-reader-ocr` on iOS development builds. If the native module is not available, such as in Expo Go, it falls back to mock OCR so the UI remains testable.

## Run

```bash
npm install
npm run ios
```

For iOS OCR, use a development build because Expo Go cannot load local native modules:

```bash
npx expo run:ios
```

To run on a connected iPhone:

```bash
npx expo run:ios --device
```

Native build requirements:

- Xcode must be installed from the App Store.
- `xcode-select -p` should point to `/Applications/Xcode.app/Contents/Developer`.
- If it points to Command Line Tools, run:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

## Checks

```bash
npm run lint
npm run typecheck
npx expo export --platform ios --output-dir /tmp/tap-reader-export
```
