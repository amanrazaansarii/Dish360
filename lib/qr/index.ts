import QRCode from "qrcode";

/**
 * QR generation. Vector for print, raster for screens.
 *
 * Error correction is fixed at H (30% recoverable) because table standees get
 * splashed, scuffed and partly covered by cutlery — and because the sage logo
 * badge punched into the middle eats into the same budget.
 */

export interface QrOptions {
  /** px for PNG, viewBox units for SVG */
  size?: number;
  dark?: string;
  light?: string;
  /** quiet-zone modules; 4 is the spec minimum */
  margin?: number;
}

export function scanUrl(code: string, origin: string): string {
  return `${origin.replace(/\/$/, "")}/t/${encodeURIComponent(code)}`;
}

export async function qrPng(data: string, options: QrOptions = {}): Promise<Buffer> {
  return QRCode.toBuffer(data, {
    type: "png",
    errorCorrectionLevel: "H",
    width: options.size ?? 1024,
    margin: options.margin ?? 4,
    color: {
      dark: options.dark ?? "#131313ff",
      light: options.light ?? "#ffffffff",
    },
  });
}

export async function qrSvg(data: string, options: QrOptions = {}): Promise<string> {
  return QRCode.toString(data, {
    type: "svg",
    errorCorrectionLevel: "H",
    width: options.size ?? 512,
    margin: options.margin ?? 4,
    color: {
      dark: options.dark ?? "#131313ff",
      light: options.light ?? "#ffffffff",
    },
  });
}

export async function qrDataUrl(data: string, options: QrOptions = {}): Promise<string> {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: "H",
    width: options.size ?? 320,
    margin: options.margin ?? 2,
    color: {
      dark: options.dark ?? "#131313ff",
      light: options.light ?? "#ffffffff",
    },
  });
}

/**
 * The module matrix, for drawing a QR code inside our own SVG rather than
 * embedding the library's output — which is how the standee keeps the sage
 * palette and the rounded modules.
 */
export async function qrMatrix(data: string): Promise<{ size: number; cells: boolean[] }> {
  const qr = QRCode.create(data, { errorCorrectionLevel: "H" });
  const size = qr.modules.size;
  const raw = qr.modules.data;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i += 1) cells.push(raw[i] === 1);
  return { size, cells };
}
