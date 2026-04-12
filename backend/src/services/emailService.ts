import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let _transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  if (_transporter) return _transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  _transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT ? parseInt(SMTP_PORT) : 587,
    secure: SMTP_PORT === '465',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return _transporter;
};

export const isEmailConfigured = (): boolean => {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
};

export const sendCertificateEmail = async (
  to: string,
  recipientName: string,
  certificateTitle: string,
  pdfUrl: string
): Promise<void> => {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(
      'Email service not configured. Skipping certificate email to:',
      to
    );
    return;
  }

  const fromEmail =
    process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@certify.app';

  await transporter.sendMail({
    from: `Certify <${fromEmail}>`,
    to,
    subject: `Your Certificate - ${certificateTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Congratulations, ${recipientName}!</h2>
        <p>Your certificate <strong>${certificateTitle}</strong> is ready.</p>
        <p>
          <a
            href="${pdfUrl}"
            style="
              display: inline-block;
              padding: 12px 24px;
              background-color: #3B82F6;
              color: #fff;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
            "
          >
            Download Certificate
          </a>
        </p>
        <p style="color: #64748B; font-size: 14px;">
          If the button above does not work, copy and paste this link into your browser:<br/>
          <a href="${pdfUrl}">${pdfUrl}</a>
        </p>
      </div>
    `,
  });
};
