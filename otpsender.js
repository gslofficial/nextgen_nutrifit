require('dotenv').config();

const BREVO_EMAIL_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

function createBrevoError(message, code, statusCode) {
  const error = new Error(message);
  error.code = code;
  if (statusCode) error.statusCode = statusCode;
  return error;
}

async function sendSystemMail(to, subject, htmlContent) {
  if (typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(to)) {
    throw createBrevoError('A valid recipient email address is required.', 'BREVO_INVALID_RECIPIENT');
  }

  const apiKey = process.env.BREVO_API;
  const senderEmail = process.env.BREVO_FROM_EMAIL;
  const senderName = process.env.BREVO_FROM_NAME || 'NextGen NutriFit';
  if (!apiKey || !senderEmail) {
    throw createBrevoError(
      'Brevo configuration is missing. Set BREVO_API and BREVO_FROM_EMAIL.',
      'BREVO_CONFIGURATION_MISSING'
    );
  }

  let response;
  try {
    response = await fetch(BREVO_EMAIL_ENDPOINT, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: to }],
        subject,
        htmlContent
      }),
      signal: AbortSignal.timeout(15000)
    });
  } catch (error) {
    const timedOut = error.name === 'TimeoutError' || error.name === 'AbortError';
    throw createBrevoError(
      timedOut ? 'Brevo email request timed out.' : 'Could not connect to the Brevo email API.',
      timedOut ? 'BREVO_TIMEOUT' : 'BREVO_NETWORK_ERROR'
    );
  }

  let result = null;
  try {
    result = await response.json();
  } catch {
    // A successful response must include Brevo's messageId before it is treated
    // as accepted. Error responses are handled below without exposing their body.
  }

  if (!response.ok) {
    const code = response.status === 401 || response.status === 403
      ? 'BREVO_AUTHENTICATION_FAILED'
      : 'BREVO_API_REJECTED';
    throw createBrevoError(`Brevo rejected the email request (HTTP ${response.status}).`, code, response.status);
  }

  if (typeof result?.messageId !== 'string' || !result.messageId.trim()) {
    throw createBrevoError('Brevo returned no message ID; email acceptance could not be confirmed.', 'BREVO_INVALID_RESPONSE', response.status);
  }

  // This confirms Brevo accepted the request, not that the recipient's inbox
  // has received it. Delivery events are available through Brevo webhooks.
  return {
    success: true,
    accepted: true,
    provider: 'brevo',
    messageId: result.messageId
  };
}

module.exports = sendSystemMail;
