# tap-reader

Multilingual camera reader prototype for iOS built with Expo and React Native.

## What works now

- Live camera screen with tappable OCR overlays
- Word and character tap modes
- Language profiles for Korean, Japanese, English, and Chinese
- Text-to-speech playback through Expo Speech
- Photo import flow with the same recognition result contract
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
  ocr/             OCR adapter implementation
  speech/          Expo Speech adapter

src/ui
  ports/           UI-facing contracts
  adapters/        UI adapter from app use cases
  screens/         React Native screens
```

The current OCR adapter is a mock provider so the app can run before native OCR is wired. Replace `mockOcrAdapter` in `src/application/container.ts` with a VisionCamera, ML Kit, or Apple Vision adapter when adding real live OCR.

## Run

```bash
npm install
npm run ios
```

For real OCR native modules, use an Expo development build instead of Expo Go.
