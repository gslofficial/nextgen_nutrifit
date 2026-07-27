require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const session = require('express-session'); 

const app = express();

// MIDDLEWARE CONFIGURATIONS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// INITIALIZE SYSTEM SESSION TRACKING
app.use(session({
  secret: 'nextgen_nutrifit_super_secure_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 } 
}));

// DEFAULT WELCOME ROUTE
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'welcomepage.html'));
});

// SERVE STATIC CLIENT ASSETS
app.use(express.static(path.join(__dirname, 'client')));

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully! '))
  .catch(err => console.error('Database connection failed :', err));

// UPDATED DATABASE SCHEMA BLUEPRINT FOR CALORIES & MACROS
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  dob: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String, default: null },         
  otpExpires: { type: Date, default: null },
  
  // Cleaned tracking array designed for macronutrients
  healthLogs: [{
    weight: Number,
    height: Number,
    calories: Number,
    protein: Number,
    fats: Number,
    carbs: Number,
    fiber: Number,
    date: { type: Date, default: Date.now }
  }]
});

const User = mongoose.model('User', userSchema);

// REGISTER USER
app.post('/auth/register', async (req, res) => {
  try {
    const { fullName, age, gender, dob, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) return res.status(400).json({ success: false, message: 'Passwords do not match!' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'Email already registered.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ fullName, age, gender, dob, email, password: hashedPassword });
    await newUser.save();
    return res.status(201).json({ success: true, message: 'Account created successfully!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// USER LOGIN
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid email or password.' });

    req.session.userId = user._id; 
    return res.status(200).json({ success: true, message: 'Login successful!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// READ LOGGED-IN PROFILE DATA
app.get('/auth/profile', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized. Please login.' });
  try {
    const user = await User.findById(req.session.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error loading profile.' });
  }
});

// AMEND PROFILE DETAILS
app.put('/auth/profile/update', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: 'Unauthorized.' });
  try {
    const { fullName, age, dob } = req.body;
    await User.findByIdAndUpdate(req.session.userId, { fullName, age, dob });
    res.json({ success: true, message: 'Profile information updated successfully! 💾' });
  } catch (err) {
    res.status(500).json({ message: 'Error processing details update.' });
  }
});

// SAVING MACRONUTRIENT WORKOUT TARGETS INTO MONGO
app.post('/auth/health-log', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ success: false, message: 'Unauthorized session.' });
  try {
    const { weight, height, calories, protein, fats, carbs, fiber } = req.body;
    
    await User.findByIdAndUpdate(req.session.userId, {
      $push: { healthLogs: { weight, height, calories, protein, fats, carbs, fiber } }
    });

    res.json({ success: true, message: 'Targets successfully saved to database profile.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server fault processing fitness metrics.' });
  }
});

// LOGOUT CLEAR DATA SESSION
app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// REQUEST FORGOT PASSWORD OTP CODE
app.post('/auth/forgot-password/request', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No gym account found.' });

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000); 

    user.otp = generatedOtp;
    user.otpExpires = expirationTime;
    await user.save();

    console.log(`\n==========================================`);
    console.log(`✉️  GYM SYSTEM SIMULATED EMAIL SENT TO: ${email}`);
    console.log(`🔑 YOUR SECURE 5-MINUTE OTP IS: ${generatedOtp}`);
    console.log(`==========================================\n`);

    return res.status(200).json({ success: true, message: 'Verification code generated! View terminal.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server request error.' });
  }
});

// VERIFY OTP AND AMEND PASSWORD
app.post('/auth/forgot-password/verify', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: 'User verification mismatch.' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid validation token code. Try again.' });
    if (new Date() > user.otpExpires) return res.status(400).json({ success: false, message: 'Your validation OTP has expired!' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successful!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server verification route processing fault.' });
  }
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`nextgen-nutrifit Server running at http://localhost:${PORT}`));
