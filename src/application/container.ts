import { createReaderUseCases } from './readerUseCases';
import { mockOcrAdapter } from '../infrastructure/ocr/mockOcrAdapter';
import { expoSpeechAdapter } from '../infrastructure/speech/expoSpeechAdapter';

export const readerUseCases = createReaderUseCases({
  ocr: mockOcrAdapter,
  speech: expoSpeechAdapter,
});
