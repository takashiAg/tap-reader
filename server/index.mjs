import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const app = express();
const upload = multer({
  limits: {
    fileSize: 60 * 1024 * 1024,
  },
  storage: multer.memoryStorage(),
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_request, response) => {
  response.json({
    gemini: Boolean(process.env.GEMINI_API_KEY),
    ok: true,
  });
});

app.post('/api/extract-vocabulary', upload.single('image'), async (request, response) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      response.status(503).json({
        error: 'GEMINI_API_KEY is not configured',
      });
      return;
    }

    if (!request.file) {
      response.status(400).json({
        error: 'image is required',
      });
      return;
    }

    const presetLabel = typeof request.body.presetLabel === 'string' ? request.body.presetLabel : '多言語';
    const result = await extractVocabularyWithGemini({
      apiKey: process.env.GEMINI_API_KEY,
      image: request.file.buffer,
      mimeType: request.file.mimetype || 'image/jpeg',
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
      presetLabel,
    });

    response.json(result);
  } catch (error) {
    response.status(500).json({
      error: normalizeError(error),
    });
  }
});

app.use((error, _request, response, next) => {
  if (!error) {
    next();
    return;
  }

  response.status(500).json({
    error: normalizeError(error),
  });
});

const distDir = path.join(rootDir, 'dist');
app.use(express.static(distDir));
app.get(/.*/, (_request, response) => {
  response.sendFile(path.join(distDir, 'index.html'));
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Tap Reader API listening on http://localhost:${port}`);
});

async function extractVocabularyWithGemini({ apiKey, image, mimeType, model, presetLabel }) {
  const prompt = [
    'You are extracting vocabulary cards from a language textbook/photo.',
    'Read the image visually. Preserve the textbook layout and pair each foreign-language term with its nearest Japanese meaning.',
    `Target language setting: ${presetLabel}. Prioritize Japanese, Korean, and English vocabulary.`,
    'Return only valid JSON. No markdown. No explanation.',
    'Schema:',
    '{"rawText":"string","cards":[{"term":"string","meaningJa":"string","reading":"string","example":"string","note":"string","confidence":0.0}]}',
    'Rules:',
    '- Exclude page numbers, decorative text, list numbers, OCR noise, and isolated symbols.',
    '- If there are multiple columns, pair by visual proximity inside the same row/block.',
    '- term is the vocabulary word/phrase. meaningJa is the Japanese meaning.',
    '- reading should be romanization for Korean, kana/roman hint for English if useful, or empty string if not useful.',
    '- confidence is 0 to 1.',
    '- Return at most 80 cards.',
  ].join('\n');

  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              data: image.toString('base64'),
              mime_type: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  };

  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      method: 'POST',
    },
  );

  if (!geminiResponse.ok) {
    const errorText = await geminiResponse.text();
    throw new Error(`Gemini API error ${geminiResponse.status}: ${errorText}`);
  }

  const json = await geminiResponse.json();
  const text = json.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
  const parsed = parseJsonText(text);
  const cards = Array.isArray(parsed.cards) ? parsed.cards : [];

  return {
    cards: cards
      .map((card, index) => ({
        confidence: clampNumber(card.confidence, 0.75),
        example: stringify(card.example),
        id: `ai-card-${index}-${stringify(card.term)}`,
        japanese: stringify(card.meaningJa),
        korean: stringify(card.term),
        note: stringify(card.note),
        reading: stringify(card.reading),
      }))
      .filter((card) => card.korean && card.japanese)
      .slice(0, 80),
    rawText: stringify(parsed.rawText || text),
  };
}

function parseJsonText(text) {
  const normalized = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  return JSON.parse(normalized);
}

function stringify(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function clampNumber(value, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.max(0, Math.min(1, number));
}

function normalizeError(error) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return JSON.stringify(error);
}
