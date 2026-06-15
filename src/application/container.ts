import { createReaderUseCases } from './readerUseCases';
import { nativeVisionOcrAdapter } from '../infrastructure/ocr/nativeVisionOcrAdapter';
import { expoSpeechAdapter } from '../infrastructure/speech/expoSpeechAdapter';

export const readerUseCases = createReaderUseCases({
  ocr: nativeVisionOcrAdapter,
  speech: expoSpeechAdapter,
});
