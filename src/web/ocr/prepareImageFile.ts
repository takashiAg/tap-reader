export async function prepareImageFile(file: File): Promise<File> {
  if (!isHeicImage(file)) {
    return file;
  }

  const { default: heic2any } = await import('heic2any');
  const converted = await heic2any({
    blob: file,
    quality: 0.92,
    toType: 'image/jpeg',
  });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  const filename = file.name.replace(/\.(heic|heif)$/i, '.jpg');

  return new File([blob], filename, { type: 'image/jpeg' });
}

function isHeicImage(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.(heic|heif)$/i.test(file.name)
  );
}
