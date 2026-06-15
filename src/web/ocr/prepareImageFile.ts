export async function prepareImageFile(file: File): Promise<File> {
  if (!isHeicImage(file)) {
    return file;
  }

  const converters = [convertWithHeicTo, convertWithHeic2Any, convertWithBrowserDecode];
  const errors: unknown[] = [];

  for (const convert of converters) {
    try {
      return await convert(file);
    } catch (error) {
      errors.push(error);
    }
  }

  throw new Error(
    `HEICをJPEGに変換できませんでした。${errors.map(normalizeErrorMessage).filter(Boolean).join(' / ')}`,
  );
}

export function isSupportedImageFile(file: File): boolean {
  return file.type.startsWith('image/') || /\.(avif|bmp|gif|heic|heif|jpe?g|png|webp)$/i.test(file.name);
}

async function convertWithHeicTo(file: File): Promise<File> {
  const { heicTo } = await import('heic-to');
  const blob = await heicTo({
    blob: file,
    quality: 0.92,
    type: 'image/jpeg',
  });

  return toJpegFile(blob, file.name);
}

async function convertWithHeic2Any(file: File): Promise<File> {
  const { default: heic2any } = await import('heic2any');
  const converted = await heic2any({
    blob: file,
    quality: 0.92,
    toType: 'image/jpeg',
  });
  const blob = Array.isArray(converted) ? converted[0] : converted;

  return toJpegFile(blob, file.name);
}

async function convertWithBrowserDecode(file: File): Promise<File> {
  if (!('createImageBitmap' in window)) {
    throw new Error('このブラウザはHEICの標準デコードに対応していません');
  }

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext('2d');

  if (!context) {
    bitmap.close();
    throw new Error('画像変換用のCanvasを作成できませんでした');
  }

  context.drawImage(bitmap, 0, 0);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error('HEIC画像をJPEGとして書き出せませんでした'));
      }
    }, 'image/jpeg', 0.92);
  });

  return toJpegFile(blob, file.name);
}

function isHeicImage(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name)
  );
}

function toJpegFile(blob: Blob, originalName: string): File {
  const filename = originalName.replace(/\.(heic|heif)$/i, '.jpg');
  return new File([blob], filename, { type: 'image/jpeg' });
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
