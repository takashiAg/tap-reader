import { createReaderUseCases } from './readerUseCases';
import { createTutorUseCases } from './tutorUseCases';
import { nativeVisionOcrAdapter } from '../infrastructure/ocr/nativeVisionOcrAdapter';
import { expoSpeechAdapter } from '../infrastructure/speech/expoSpeechAdapter';
import { localTutorAdapter } from '../infrastructure/tutor/localTutorAdapter';
import { simplePronunciationReviewAdapter } from '../infrastructure/tutor/simplePronunciationReviewAdapter';

export const readerUseCases = createReaderUseCases({
  ocr: nativeVisionOcrAdapter,
  speech: expoSpeechAdapter,
});

export const tutorUseCases = createTutorUseCases({
  reviewer: simplePronunciationReviewAdapter,
  speech: expoSpeechAdapter,
  tutor: localTutorAdapter,
});
