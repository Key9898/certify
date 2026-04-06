import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import type { ITemplateField, ITemplateFieldStyle, TemplateMode } from '../models/Template';

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

const getBrowser = async (): Promise<Browser> => {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });
  }
  return browserInstance;
};

const loadTemplate = (templateName: string): string => {
  const templatePath = path.join(__dirname, '../../templates', `${templateName}.html`);
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

const escapeMultilineText = (value: string): string => escapeHtml(value).replace(/\n/g, '<br />');

const injectData = (html: string, data: PdfData): string => {
  return html
    .replace(/\{\{recipientName\}\}/g, escapeHtml(data.recipientName))
    .replace(/\{\{certificateTitle\}\}/g, escapeHtml(data.certificateTitle))
    .replace(/\{\{description\}\}/g, escapeMultilineText(data.description || ''))
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
    .replace(/\{\{primaryColor\}\}/g, escapeHtml(data.primaryColor || '#3B82F6'))
    .replace(/\{\{secondaryColor\}\}/g, escapeHtml(data.secondaryColor || '#64748B'))
    .replace(/\{\{certificateId\}\}/g, escapeHtml(data.certificateId));
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

const renderBackgroundTemplateHtml = (template: TemplateRenderSource, data: PdfData): string => {
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
      </style>
    </head>
    <body>
      <div class="certificate">
        ${backgroundImageUrl ? `<img src="${escapeHtml(backgroundImageUrl)}" alt="Template background" class="background-image" />` : ''}
        ${fieldsHtml}
      </div>
    </body>
    </html>
  `.trim();
};

const resolveTemplateHtml = (
  templateSource: string | TemplateRenderSource,
  data: PdfData
): string => {
  if (typeof templateSource === 'string') {
    return injectData(loadTemplate(templateSource), data);
  }

  const isBackgroundTemplate =
    templateSource.mode === 'background' || templateSource.htmlContent === 'custom-background';

  if (isBackgroundTemplate) {
    return renderBackgroundTemplateHtml(templateSource, data);
  }

  return injectData(loadTemplate(templateSource.htmlContent), data);
};

export const generatePdf = async (
  templateSource: string | TemplateRenderSource,
  data: PdfData
): Promise<Buffer> => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    const populatedHtml = resolveTemplateHtml(templateSource, data);

    await page.setContent(populatedHtml, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
};

export const generatePng = async (
  templateSource: string | TemplateRenderSource,
  data: PdfData
): Promise<Buffer> => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    const populatedHtml = resolveTemplateHtml(templateSource, data);

    // A4 landscape at 150dpi
    await page.setViewport({ width: 1587, height: 1122, deviceScaleFactor: 2 });
    await page.setContent(populatedHtml, { waitUntil: 'networkidle0' });

    const screenshotBuffer = await page.screenshot({
      type: 'png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1587, height: 1122 },
    });

    return Buffer.from(screenshotBuffer);
  } finally {
    await page.close();
  }
};

export const closeBrowser = async (): Promise<void> => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
};
