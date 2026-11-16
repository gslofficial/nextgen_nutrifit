require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const User = require('./models/User');

// Match server.js: some Windows/network DNS configurations refuse SRV lookups
// through the default resolver, which mongodb+srv requires.
dns.setServers(['8.8.8.8', '1.1.1.1']);

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
  if (error.code === 'ECONNREFUSED' || error.syscall === 'querySrv') {
    console.error('Could not resolve the MongoDB Atlas SRV record. Check that this network allows DNS queries to 8.8.8.8 or 1.1.1.1, and that MONGO_URI contains the correct Atlas cluster hostname. No account changes were made.');
  } else {
    console.error('Could not make user an administrator:', error.message);
  }
  process.exitCode = 1;
}).finally(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});
