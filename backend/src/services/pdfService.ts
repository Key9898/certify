import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import type {
  ITemplateField,
  ITemplateFieldStyle,
  TemplateMode,
} from '../models/Template';

export interface PdfData {
  recipientName: string;
  certificateTitle: string;
  description?: string;
  issueDate: string;
  expiryDate?: string;
  issuerName: string;
  issuerSignature?: string;
  organizationLogo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  certificateId: string;
  verifyUrl?: string;
  [key: string]: string | undefined;
}

export interface TemplateRenderSource {
  mode?: TemplateMode;
  htmlContent: string;
  styles?: string;
  backgroundImageUrl?: string;
  fields?: ITemplateField[];
}

let browserInstance: Browser | null = null;
let browserLaunchPromise: Promise<Browser> | null = null;
const BROWSER_TIMEOUT_MS = 30000;
const PDF_GENERATION_TIMEOUT_MS = 60000;

const isBrowserHealthy = async (browser: Browser): Promise<boolean> => {
  try {
    const pages = await browser.pages();
    return pages.length >= 0;
  } catch {
    return false;
  }
};

const closeBrowserInstance = async (): Promise<void> => {
  if (browserInstance) {
    try {
      await browserInstance.close();
    } catch {
      // Browser already closed or crashed
    }
    browserInstance = null;
    browserLaunchPromise = null;
  }
};

const getBrowser = async (): Promise<Browser> => {
  if (browserInstance) {
    const healthy = await isBrowserHealthy(browserInstance);
    if (healthy) {
      return browserInstance;
    }
    await closeBrowserInstance();
  }

  if (browserLaunchPromise) {
    return browserLaunchPromise;
  }

  browserLaunchPromise = (async () => {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--disable-extensions',
      ],
      timeout: BROWSER_TIMEOUT_MS,
    });

    browser.on('disconnected', () => {
      browserInstance = null;
      browserLaunchPromise = null;
    });

    browserInstance = browser;
    return browser;
  })();

  return browserLaunchPromise;
};

const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
};

const loadTemplate = (templateName: string): string => {
  const templatePath = path.join(
    __dirname,
    '../../templates',
    `${templateName}.html`
  );
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template ${templateName} not found`);
  }
  return fs.readFileSync(templatePath, 'utf-8');
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeMultilineText = (value: string): string =>
  escapeHtml(value).replace(/\n/g, '<br />');

const generateQRCodeDataUrl = async (
  certificateId: string,
  verifyUrl?: string
): Promise<string> => {
  const url = verifyUrl || `https://certify.app/verify/${certificateId}`;
  try {
    return await QRCode.toDataURL(url, {
      width: 150,
      margin: 1,
      color: { dark: '#1a1a1a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });
  } catch {
    return '';
  }
};

const injectData = (
  html: string,
  data: PdfData,
  qrCodeDataUrl?: string
): string => {
  return html
    .replace(/\{\{recipientName\}\}/g, escapeHtml(data.recipientName))
    .replace(/\{\{certificateTitle\}\}/g, escapeHtml(data.certificateTitle))
    .replace(
      /\{\{description\}\}/g,
      escapeMultilineText(data.description || '')
    )
    .replace(/\{\{issueDate\}\}/g, escapeHtml(data.issueDate))
    .replace(/\{\{issuerName\}\}/g, escapeHtml(data.issuerName))
    .replace(
      /\{\{issuerSignature\}\}/g,
      data.issuerSignature
        ? `<img src="${escapeHtml(data.issuerSignature)}" alt="Signature" class="signature-img" />`
        : ''
    )
    .replace(
      /\{\{organizationLogo\}\}/g,
      data.organizationLogo
        ? `<img src="${escapeHtml(data.organizationLogo)}" alt="Logo" class="logo-img" />`
        : ''
    )
    .replace(
      /\{\{primaryColor\}\}/g,
      escapeHtml(data.primaryColor || '#3B82F6')
    )
    .replace(
      /\{\{secondaryColor\}\}/g,
      escapeHtml(data.secondaryColor || '#64748B')
    )
    .replace(/\{\{certificateId\}\}/g, escapeHtml(data.certificateId))
    .replace(
      /\{\{verifyQR\}\}/g,
      qrCodeDataUrl
        ? `<img src="${qrCodeDataUrl}" alt="Verify QR Code" class="qr-code" />`
        : ''
    );
};

const resolveFieldValue = (field: ITemplateField, data: PdfData): string => {
  return (data[field.name] || field.defaultValue || '').trim();
};

const buildTextFieldStyle = (
  field: ITemplateField,
  style: ITemplateFieldStyle,
  fallbackColor: string
): string => {
  const width = field.size?.width ?? 32;
  const fontSize = style.fontSize ?? 24;
  const fontWeight = style.fontWeight ?? 600;
  const fontFamily = style.fontFamily || 'Arial, sans-serif';
  const color = style.color || fallbackColor;
  const textAlign = style.textAlign || 'center';
  const lineHeight = style.lineHeight ?? 1.2;
  const letterSpacing = style.letterSpacing ?? 0;
  const fontStyle = style.fontStyle || 'normal';
  const textTransform = style.textTransform || 'none';

  return [
    `left:${field.position.x}%`,
    `top:${field.position.y}%`,
    `width:${width}%`,
    'position:absolute',
    'transform:translate(-50%, -50%)',
    `font-size:${fontSize}px`,
    `font-weight:${fontWeight}`,
    `font-family:${fontFamily}`,
    `color:${color}`,
    `text-align:${textAlign}`,
    `line-height:${lineHeight}`,
    `letter-spacing:${letterSpacing}px`,
    `font-style:${fontStyle}`,
    `text-transform:${textTransform}`,
    'white-space:pre-wrap',
    'word-break:break-word',
  ].join(';');
};

const buildImageFieldStyle = (field: ITemplateField): string => {
  const width = field.size?.width ?? 18;
  const height = field.size?.height;

  return [
    `left:${field.position.x}%`,
    `top:${field.position.y}%`,
    `width:${width}%`,
    height ? `height:${height}%` : '',
    'position:absolute',
    'transform:translate(-50%, -50%)',
    'object-fit:contain',
    'object-position:center',
  ]
    .filter(Boolean)
    .join(';');
};

const renderBackgroundTemplateHtml = (
  template: TemplateRenderSource,
  data: PdfData,
  qrCodeDataUrl?: string
): string => {
  const textColorFallback = data.primaryColor || '#111827';
  const backgroundImageUrl = template.backgroundImageUrl || '';
  const fieldsHtml = (template.fields || [])
    .filter((field) => field.visible !== false)
    .map((field) => {
      const value = resolveFieldValue(field, data);

      if (field.type === 'image') {
        if (!value) {
          return '';
        }

        return `<img src="${escapeHtml(value)}" alt="${escapeHtml(field.label)}" style="${buildImageFieldStyle(field)}" />`;
      }

      if (!value) {
        return '';
      }

      return `<div style="${buildTextFieldStyle(field, field.style || {}, textColorFallback)}">${escapeMultilineText(value)}</div>`;
    })
    .join('');

  const hasIdField = (template.fields || []).some(
    (f) => f.name === 'certificateId' && f.visible !== false
  );

  const hasQRField = (template.fields || []).some(
    (f) => f.name === 'verifyQR' && f.visible !== false
  );

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #fff; -webkit-print-color-adjust: exact; }
        .certificate {
          width: 297mm;
          height: 210mm;
          position: relative;
          overflow: hidden;
          background: #fff;
        }
        .background-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .cert-id-stamp {
          position: absolute;
          bottom: 6mm;
          right: 8mm;
          font-size: 8px;
          font-family: monospace;
          color: rgba(0,0,0,0.35);
          letter-spacing: 0.5px;
          line-height: 1;
          pointer-events: none;
        }
        .qr-stamp {
          position: absolute;
          bottom: 6mm;
          left: 8mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .qr-stamp img {
          width: 25mm;
          height: 25mm;
        }
        .qr-stamp-label {
          font-size: 6px;
          color: rgba(0,0,0,0.5);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        ${backgroundImageUrl ? `<img src="${escapeHtml(backgroundImageUrl)}" alt="Template background" class="background-image" />` : ''}
        ${fieldsHtml}
        ${!hasIdField ? `<div class="cert-id-stamp">ID: ${escapeHtml(data.certificateId)}</div>` : ''}
        ${!hasQRField && qrCodeDataUrl ? `<div class="qr-stamp"><img src="${qrCodeDataUrl}" alt="Verify QR" /><span class="qr-stamp-label">Scan to verify</span></div>` : ''}
      </div>
    </body>
    </html>
  `.trim();
};

const resolveTemplateHtml = async (
  templateSource: string | TemplateRenderSource,
  data: PdfData
): Promise<string> => {
  const qrCodeDataUrl = await generateQRCodeDataUrl(
    data.certificateId,
    data.verifyUrl
  );

  if (typeof templateSource === 'string') {
    return injectData(loadTemplate(templateSource), data, qrCodeDataUrl);
  }

  const isBackgroundTemplate =
    templateSource.mode === 'background' ||
    templateSource.htmlContent === 'custom-background';

  if (isBackgroundTemplate) {
    return renderBackgroundTemplateHtml(templateSource, data, qrCodeDataUrl);
  }

  return injectData(
    loadTemplate(templateSource.htmlContent),
    data,
    qrCodeDataUrl
  );
};

export const generatePdf = async (
  templateSource: string | TemplateRenderSource,
  data: PdfData
): Promise<Buffer> => {
  const browser = await withTimeout(
    getBrowser(),
    BROWSER_TIMEOUT_MS,
    'Browser launch timed out'
  );
  const page = await browser.newPage();

  try {
    const populatedHtml = await resolveTemplateHtml(templateSource, data);

    await withTimeout(
      page.setContent(populatedHtml, {
        waitUntil: 'networkidle0',
        timeout: 15000,
      }),
      20000,
      'Page content loading timed out'
    );

    const pdfBuffer = await withTimeout(
      page.pdf({
        format: 'A4',
        landscape: true,
        printBackground: true,
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
      }),
      PDF_GENERATION_TIMEOUT_MS,
      'PDF generation timed out'
    );

    return Buffer.from(pdfBuffer);
  } catch (error) {
    if (error instanceof Error && error.message.includes('timed out')) {
      await closeBrowserInstance();
    }
    throw error;
  } finally {
    try {
      await page.close();
    } catch {
      // Page already closed
    }
  }
};

export const generatePng = async (
  templateSource: string | TemplateRenderSource,
  data: PdfData
): Promise<Buffer> => {
  const browser = await withTimeout(
    getBrowser(),
    BROWSER_TIMEOUT_MS,
    'Browser launch timed out'
  );
  const page = await browser.newPage();

  try {
    const populatedHtml = await resolveTemplateHtml(templateSource, data);

    await page.setViewport({ width: 1587, height: 1122, deviceScaleFactor: 2 });
    await withTimeout(
      page.setContent(populatedHtml, {
        waitUntil: 'networkidle0',
        timeout: 15000,
      }),
      20000,
      'Page content loading timed out'
    );

    const screenshotBuffer = await withTimeout(
      page.screenshot({
        type: 'png',
        fullPage: false,
        clip: { x: 0, y: 0, width: 1587, height: 1122 },
      }),
      PDF_GENERATION_TIMEOUT_MS,
      'PNG generation timed out'
    );

    return Buffer.from(screenshotBuffer);
  } catch (error) {
    if (error instanceof Error && error.message.includes('timed out')) {
      await closeBrowserInstance();
    }
    throw error;
  } finally {
    try {
      await page.close();
    } catch {
      // Page already closed
    }
  }
};

export const closeBrowser = async (): Promise<void> => {
  await closeBrowserInstance();
};
