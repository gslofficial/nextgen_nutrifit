const test = require('node:test');
const assert = require('node:assert/strict');

const sendSystemMail = require('../otpsender');

const originalEnvironment = {
  BREVO_API: process.env.BREVO_API,
  BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL,
  BREVO_FROM_NAME: process.env.BREVO_FROM_NAME
};
const originalFetch = global.fetch;

test.beforeEach(() => {
  process.env.BREVO_API = 'test-api-key';
  process.env.BREVO_FROM_EMAIL = 'sender@example.test';
  process.env.BREVO_FROM_NAME = 'NextGen NutriFit Test';
});

test.after(() => {
  global.fetch = originalFetch;
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test('posts the expected Brevo transactional email and requires a messageId', async () => {
  let request;
  global.fetch = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({ messageId: '<test-id>' }), {
      status: 201,
      headers: { 'content-type': 'application/json' }
    });
  };

  const result = await sendSystemMail('recipient@example.test', 'OTP', '<p>Code</p>');
  const payload = JSON.parse(request.options.body);

  assert.equal(request.url, 'https://api.brevo.com/v3/smtp/email');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers['api-key'], 'test-api-key');
  assert.deepEqual(payload.sender, { email: 'sender@example.test', name: 'NextGen NutriFit Test' });
  assert.deepEqual(payload.to, [{ email: 'recipient@example.test' }]);
  assert.equal(payload.subject, 'OTP');
  assert.equal(payload.htmlContent, '<p>Code</p>');
  assert.deepEqual(result, { success: true, accepted: true, provider: 'brevo', messageId: '<test-id>' });
});

test('rejects unauthorized Brevo responses without exposing their body', async () => {
  global.fetch = async () => new Response(JSON.stringify({ message: 'private provider details' }), { status: 401 });
  await assert.rejects(
    sendSystemMail('recipient@example.test', 'OTP', '<p>Code</p>'),
    error => error.code === 'BREVO_AUTHENTICATION_FAILED' && error.statusCode === 401 && !error.message.includes('private provider details')
  );
});

test('rejects successful responses without a Brevo messageId', async () => {
  global.fetch = async () => new Response('{}', { status: 201 });
  await assert.rejects(
    sendSystemMail('recipient@example.test', 'OTP', '<p>Code</p>'),
    error => error.code === 'BREVO_INVALID_RESPONSE'
  );
});

test('reports missing API key or sender configuration', async () => {
  process.env.BREVO_API = '';
  await assert.rejects(
    sendSystemMail('recipient@example.test', 'OTP', '<p>Code</p>'),
    error => error.code === 'BREVO_CONFIGURATION_MISSING'
  );

  process.env.BREVO_API = 'test-api-key';
  process.env.BREVO_FROM_EMAIL = '';
  await assert.rejects(
    sendSystemMail('recipient@example.test', 'OTP', '<p>Code</p>'),
    error => error.code === 'BREVO_CONFIGURATION_MISSING'
  );
});

test('rejects a Brevo SMTP key when the REST API key is required', async () => {
  process.env.BREVO_API = 'xsmtpsib-test-only';
  await assert.rejects(
    sendSystemMail('recipient@example.test', 'OTP', '<p>Code</p>'),
    error => error.code === 'BREVO_SMTP_KEY_USED_AS_API_KEY'
  );
});

test('handles network and timeout failures without claiming acceptance', async () => {
  global.fetch = async () => { throw new TypeError('network unavailable'); };
  await assert.rejects(
    sendSystemMail('recipient@example.test', 'OTP', '<p>Code</p>'),
    error => error.code === 'BREVO_NETWORK_ERROR'
  );

  global.fetch = async () => {
    const error = new Error('request timed out');
    error.name = 'TimeoutError';
    throw error;
  };
  await assert.rejects(
    sendSystemMail('recipient@example.test', 'OTP', '<p>Code</p>'),
    error => error.code === 'BREVO_TIMEOUT'
  );
});

test('rejects malformed recipients before making an API request', async () => {
  let requested = false;
  global.fetch = async () => { requested = true; };
  await assert.rejects(
    sendSystemMail('invalid-address', 'OTP', '<p>Code</p>'),
    error => error.code === 'BREVO_INVALID_RECIPIENT'
  );
  assert.equal(requested, false);
});
