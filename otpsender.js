const nodemailer = require('nodemailer');
require('dotenv').config();

const EMAIL = process.env.APP_EMAIL;
const PASSWORD = process.env.APP_PASS;

async function sendSystemMail(to, subject, htmlContent) {
  if (typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) {
    throw new Error('A valid recipient email address is required.');
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
