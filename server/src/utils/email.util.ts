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
    // Enhanced development mode logging
    console.log('\n' + '='.repeat(60));
    console.log('📧 EMAIL NOT SENT (Development Mode)');
    console.log('='.repeat(60));
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`From: ${fromName || 'GroChain'}`);
    console.log('Content Preview:');
    console.log(html.substring(0, 300) + (html.length > 300 ? '...' : ''));
    console.log('='.repeat(60));
    console.log('💡 To enable real email sending, configure SMTP environment variables:');
    console.log('   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
    console.log('='.repeat(60) + '\n');
    
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





