const nodemailer = require('nodemailer');
require('dotenv').config();

const EMAIL = process.env.APP_EMAIL;
const PASSWORD = process.env.APP_PASS;
const EMAIL_PROVIDER = String(process.env.EMAIL_PROVIDER || 'smtp').trim().toLowerCase();

async function sendSystemMail(to, subject, htmlContent) {
  if (typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) {
    throw new Error('A valid recipient email address is required.');
  }

  // Render's free web services block outbound SMTP ports. Use Resend's HTTPS
  // API there; keep SMTP as the default so existing local setups still work.
  if (EMAIL_PROVIDER === 'resend') {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    if (!apiKey || !from) {
      throw new Error('Resend email configuration is missing. Set RESEND_API_KEY and RESEND_FROM_EMAIL.');
    }

    const { Resend } = require('resend');
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html: htmlContent
    });
    if (error) throw new Error(`Resend could not send email: ${error.message}`);
    console.log(`Email successfully dispatched to ${to} via Resend.`);
    return { success: true, id: data?.id };
  }

  if (EMAIL_PROVIDER !== 'smtp') {
    throw new Error('EMAIL_PROVIDER must be either "smtp" or "resend".');
  }
  if (!EMAIL || !PASSWORD) throw new Error('Email sender configuration is missing.');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', port: 465, secure: true,
    auth: { user: EMAIL, pass: PASSWORD }
  });
  const info = await transporter.sendMail({ from: `"NextGenNutriFit" <${EMAIL}>`, to, subject, html: htmlContent });
  console.log(`Email successfully dispatched to ${to}: ${info.response}`);
  return { success: true, response: info.response };
}

module.exports = sendSystemMail;
