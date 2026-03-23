declare module 'qrcode' {
  export interface QRCodeToDataURLOptions {
    margin?: number;
    scale?: number;
    width?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    color?: {
      dark?: string;
      light?: string;
    };
  }

  export function toDataURL(
    data: string | any[],
    options?: QRCodeToDataURLOptions,
    callback?: (err: Error | null, url?: string) => void
  ): Promise<string>;

  export function toString(
    data: string | any[],
    options?: any,
    callback?: (err: Error | null, string?: string) => void
  ): Promise<string>;

  export function toCanvas(
    canvas: any,
    data: string | any[],
    options?: any,
    callback?: (err: Error | null) => void
  ): Promise<void>;
}
