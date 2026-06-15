declare module 'heic2any' {
  type ConversionOptions = {
    blob: Blob;
    quality?: number;
    toType?: string;
  };

  export default function heic2any(options: ConversionOptions): Promise<Blob | Blob[]>;
}
