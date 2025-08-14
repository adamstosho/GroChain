import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
}

function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendEmail({ to, subject, html, fromName }: EmailOptions) {
  if (!isEmailConfigured()) {
    // Fallback to console in non-configured environments
    // eslint-disable-next-line no-console
    console.log(`[Email:DEV] To: ${to} | Subject: ${subject}\n${html.substring(0, 200)}...`);
    return { success: true, messageId: 'dev-log' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const from = `${fromName || 'GroChain'} <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

  const info = await transporter.sendMail({ from, to, subject, html });
  return { success: true, messageId: info.messageId };
}





