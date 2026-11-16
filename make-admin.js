require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const email = String(process.argv[2] || '').trim().toLowerCase();
const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function main() {
  if (!validEmail.test(email)) {
    console.error('Usage: node make-admin.js valid-email@example.com');
    process.exitCode = 1;
    return;
  }
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not configured in .env.');
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email });
  if (!user) {
    console.log(`No account found for ${email}. The user must register first.`);
    return;
  }
  if (user.role === 'admin') {
    console.log(`${email} is already an administrator.`);
    return;
  }
  user.role = 'admin';
  await user.save();
  console.log(`${email} is now an administrator.`);
}

main().catch(error => {
  console.error('Could not make user an administrator:', error.message);
  process.exitCode = 1;
}).finally(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});
