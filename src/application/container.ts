import { createReaderUseCases } from './readerUseCases';
import { createTutorUseCases } from './tutorUseCases';
import { createVocabularyUseCases } from './vocabularyUseCases';
import { nativeVisionOcrAdapter } from '../infrastructure/ocr/nativeVisionOcrAdapter';
import { expoSpeechAdapter } from '../infrastructure/speech/expoSpeechAdapter';
import { localTutorAdapter } from '../infrastructure/tutor/localTutorAdapter';
import { simplePronunciationReviewAdapter } from '../infrastructure/tutor/simplePronunciationReviewAdapter';
import { ocrVocabularyAdapter } from '../infrastructure/vocabulary/ocrVocabularyAdapter';

export const readerUseCases = createReaderUseCases({
  ocr: nativeVisionOcrAdapter,
  speech: expoSpeechAdapter,
});

export const tutorUseCases = createTutorUseCases({
  reviewer: simplePronunciationReviewAdapter,
  speech: expoSpeechAdapter,
  tutor: localTutorAdapter,
});

export const vocabularyUseCases = createVocabularyUseCases({
  extraction: ocrVocabularyAdapter,
  speech: expoSpeechAdapter,
});
