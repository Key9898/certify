import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs';
import path from 'path';

export interface PdfData {
  recipientName: string;
  certificateTitle: string;
  description?: string;
  issueDate: string;
  issuerName: string;
  issuerSignature?: string;
  organizationLogo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  certificateId: string;
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

const injectData = (html: string, data: PdfData): string => {
  return html
    .replace(/\{\{recipientName\}\}/g, data.recipientName)
    .replace(/\{\{certificateTitle\}\}/g, data.certificateTitle)
    .replace(/\{\{description\}\}/g, data.description || '')
    .replace(/\{\{issueDate\}\}/g, data.issueDate)
    .replace(/\{\{issuerName\}\}/g, data.issuerName)
    .replace(
      /\{\{issuerSignature\}\}/g,
      data.issuerSignature
        ? `<img src="${data.issuerSignature}" alt="Signature" class="signature-img" />`
        : ''
    )
    .replace(
      /\{\{organizationLogo\}\}/g,
      data.organizationLogo
        ? `<img src="${data.organizationLogo}" alt="Logo" class="logo-img" />`
        : ''
    )
    .replace(/\{\{primaryColor\}\}/g, data.primaryColor || '#3B82F6')
    .replace(/\{\{secondaryColor\}\}/g, data.secondaryColor || '#64748B')
    .replace(/\{\{certificateId\}\}/g, data.certificateId);
};

export const generatePdf = async (templateName: string, data: PdfData): Promise<Buffer> => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    const html = loadTemplate(templateName);
    const populatedHtml = injectData(html, data);

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

export const generatePng = async (templateName: string, data: PdfData): Promise<Buffer> => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    const html = loadTemplate(templateName);
    const populatedHtml = injectData(html, data);

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
