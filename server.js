require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const session = require('express-session'); 
const nodemailer = require('nodemailer');
const dns = require('dns').promises;
// Use reliable public resolvers explicitly - some networks/OS configs have a
// broken or firewalled default DNS resolver, which was causing valid domains
// like gmail.com to incorrectly fail the MX lookup below.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

// MIDDLEWARE CONFIGURATIONS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// INITIALIZE SYSTEM SESSION TRACKING
app.set('trust proxy', 1); // needed because Render sits behind a proxy

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 2,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// DEFAULT WELCOME ROUTE
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'welcomepage.html'));
});

// SERVE STATIC CLIENT ASSETS
app.use(express.static(path.join(__dirname, 'client')));

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
    seedInitialData(); // ✅ NEW
  })
  .catch(err => console.error('Database connection failed :', err));

// UPDATED DATABASE SCHEMA BLUEPRINT FOR ADDRESS & AUTOMATIC AGE
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true }, // 1. Added address field tracking
  age: { type: Number, required: true },       // 2. Kept as number, but computed from DOB
  gender: { type: String, required: true },
  dob: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String, default: null },         
  otpExpires: { type: Date, default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // ✅ NEW: admin role flag
  
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

// ========================================================
// ✅ NEW: FOOD DIARY ITEM SCHEMA (managed from the admin panel)
// ========================================================
const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },   // Vegetarian / Non-Vegetarian
  group: { type: String, required: true },  // Grain, Vegetable, Fruit, Protein, etc.
  kcal: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  image: { type: String, default: '' },
  emoji: { type: String, default: '🍽️' }
}, { timestamps: true });

const Food = mongoose.model('Food', foodSchema);

// ========================================================
// ✅ NEW: EXERCISE SCHEMA (managed from the admin panel)
// ========================================================
const exerciseSchema = new mongoose.Schema({
  exerciseId: { type: String, required: true, unique: true }, // slug-style id used by the client
  cat: { type: String, required: true, enum: ['home', 'gym', 'yoga'] },
  group: { type: String, default: '' }, // only used for cat === 'gym' (legs, chest, back, etc.)
  muscle: { type: String, required: true },
  name: { type: String, required: true },
  pattern: { type: String, default: 'core' },
  type: { type: String, required: true, enum: ['reps', 'hold'] },
  sets: { type: Number, default: 3 },
  reps: { type: Number },
  hold: { type: Number },
  rest: { type: Number, default: 30 },
  video: { type: String, default: '' },
  cues: [{ type: String }]
}, { timestamps: true });

const Exercise = mongoose.model('Exercise', exerciseSchema);

// ========================================================
// ✅ NEW: ONE-TIME SEEDING OF EXISTING FOOD / EXERCISE DATA
// Only runs if the collections are empty, so it's safe to
// leave in place permanently and never overwrites admin edits.
// ========================================================
async function seedInitialData() {
  try {
    const foodCount = await Food.countDocuments();
    if (foodCount === 0) {
      const seedFoods = require('./data/foods-seed.json');
      await Food.insertMany(seedFoods);
      console.log(`🌱 Seeded ${seedFoods.length} food items into the database.`);
    }

    const exerciseCount = await Exercise.countDocuments();
    if (exerciseCount === 0) {
      const seedExercises = require('./data/exercises-seed.json').map(e => ({
        exerciseId: e.id,
        cat: e.cat,
        group: e.group || '',
        muscle: e.muscle,
        name: e.name,
        pattern: e.pattern,
        type: e.type,
        sets: e.sets,
        reps: e.reps,
        hold: e.hold,
        rest: e.rest,
        video: e.video,
        cues: e.cues || []
      }));
      await Exercise.insertMany(seedExercises);
      console.log(`🌱 Seeded ${seedExercises.length} exercises into the database.`);
    }
  } catch (err) {
    console.error('Seeding failed:', err);
  }
}



// ========================================================
// 📧 DYNAMIC EMAIL AUTHENTICATION SYSTEM (NO HARDCODED TO:)
// ========================================================
async function sendSystemMail(to, subject, htmlContent) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.APP_EMAIL,
                pass: process.env.APP_PASS // Your secure 16-character app password
            }
        });

        const mailOptions = {
            from: `"NextGenNutriFit Engine" <${process.env.APP_EMAIL}>`,
            to: to, // Targets the active user dynamically!
            subject: subject,
            html: htmlContent 
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email successfully dispatched to ${to}:`, info.response);
        return { success: true, response: info.response };
        
    } catch (error) {
        console.error(`Nodemailer transport pipeline failure targeting ${to}:`, error);
        throw error; 
    }
}

// ========================================================
// ✅ NEW: EMAIL EXISTENCE VALIDATION HELPERS
// ========================================================

// Basic strict format check (rejects obvious junk like "abc@@a", "abc@a", etc.)
function isValidEmailFormat(email) {
  const strictEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return typeof email === 'string' && strictEmailRegex.test(email);
}

// Checks that the email's domain actually has mail servers configured (MX records).
// This blocks typos/fake domains (e.g. "gmial.com", "test.com" with no mail setup)
// but it CANNOT confirm the specific mailbox exists — that's what the OTP step below is for.
//
// IMPORTANT: we only return false when DNS explicitly tells us the domain has
// no mail server (ENOTFOUND / ENODATA). If the lookup itself fails for some
// other reason (timeout, no network, DNS server unreachable), we let the email
// through rather than falsely blocking real addresses like gmail.com - the OTP
// step is still there to catch anything actually fake.
async function domainHasMailServer(email) {
  const domain = email.split('@')[1];
  if (!domain) return false;

  try {
    const records = await dns.resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch (err) {
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      // Domain genuinely has no mail server / doesn't exist
      return false;
    }
    // Some other failure (timeout, network issue, resolver unreachable, etc.)
    // Don't punish the user for our DNS check failing - just log and allow it.
    console.warn(`MX lookup for "${domain}" failed with ${err.code || err.message}, allowing through.`);
    return true;
  }
}

// In-memory store for pending (not-yet-verified) registrations.
// Key: email, Value: { userData, otp, otpExpires }
// NOTE: this resets if the server restarts. For production, consider storing
// this in MongoDB with a TTL index instead of in-memory.
const pendingRegistrations = new Map();


// ========================================================
// 🚀 STEP 1: START REGISTRATION - VALIDATE EMAIL + SEND OTP
// (Account is NOT created yet - only after OTP is verified below)
// ========================================================
app.post('/auth/register', async (req, res) => {
  try {
    const { fullName, address, gender, dob, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match!'
      });
    }

    // 1. Reject malformed email addresses outright
    if (!isValidEmailFormat(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.'
      });
    }

    // 2. Reject domains that have no mail server at all (catches typos/fake domains)
    const domainOk = await domainHasMailServer(email);
    if (!domainOk) {
      return res.status(400).json({
        success: false,
        message: 'This email domain does not appear to accept mail. Please check for typos.'
      });
    }

    // Check if email is already a confirmed, registered account
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    // Calculate age automatically
    const birthDate = new Date(dob);
    const today = new Date();

    let calculatedAge =
      today.getFullYear() - birthDate.getFullYear();

    const monthDifference =
      today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      calculatedAge--;
    }

    // Encrypt password now, but don't save the user yet
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Generate an OTP and hold the registration in pending state
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    pendingRegistrations.set(email, {
      userData: {
        fullName,
        address,
        age: calculatedAge,
        gender,
        dob,
        email,
        password: hashedPassword
      },
      otp: generatedOtp,
      otpExpires: expirationTime
    });

    const otpSubject = "Verify Your Email - NextGenNutriFit 🔑";
    const otpHtml = `
      <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #dadce0; border-radius: 16px; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #3a8e3d; font-weight: 700; margin-bottom: 5px;">Verify Your Email Address</h2>
        <p style="color: #555; font-size: 14px;">Enter this code to confirm your email and finish creating your NextGenNutriFit account:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px dashed #4caf50;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #222;">${generatedOtp}</span>
        </div>
        <p style="font-size: 11px; color: #999;">This verification code expires in 10 minutes.</p>
      </div>
    `;

    try {
      await sendSystemMail(email, otpSubject, otpHtml);
    } catch (mailErr) {
      pendingRegistrations.delete(email);
      console.error('Failed to send verification email:', mailErr);
      return res.status(500).json({
        success: false,
        message: 'Could not send a verification email to that address. Please check it and try again.'
      });
    }

    return res.status(200).json({
      success: true,
      requiresVerification: true,
      message: 'A verification code was sent to your email. Please verify to complete registration.'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Registration could not be started.'
    });
  }
});


// ========================================================
// 🔑 STEP 2: VERIFY OTP -> ACTUALLY CREATE THE ACCOUNT
// ========================================================
app.post('/auth/register/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const pending = pendingRegistrations.get(email);
    if (!pending) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found for this email. Please register again.'
      });
    }

    if (new Date() > pending.otpExpires) {
      pendingRegistrations.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Verification code expired. Please register again.'
      });
    }

    if (pending.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Try again.'
      });
    }

    // Double check no one raced us to this email while it was pending
    const userExists = await User.findOne({ email });
    if (userExists) {
      pendingRegistrations.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    const newUser = new User(pending.userData);
    await newUser.save();
    pendingRegistrations.delete(email);

    // Send the original welcome/confirmation email now that the account is real
    const welcomeSubject = "Welcome to NextGenNutriFit! 🎉";
    const welcomeHtml = `
      <div style="
        font-family: Arial, sans-serif;
        padding: 25px;
        border: 1px solid #e0e0e0;
        border-radius: 16px;
        max-width: 480px;
        margin: 0 auto;
      ">

        <h2 style="
          color: red;
          font-weight: 700;
          margin-bottom: 5px;
        ">
          NEXTGEN <span style="color: #0b0b0b;">NUTRIFIT</span>
        </h2>

        <p style="
          font-size: 16px;
          color: #333;
          font-weight: bold;
        ">
          Hello ${newUser.fullName}! 👋
        </p>

        <p style="
          color: #555;
          line-height: 1.5;
        ">
          Your NextGenNutriFit account has been created successfully.
          Welcome to our fitness and nutrition platform!
        </p>

        <div style="
          background-color: #f4fff4;
          padding: 15px;
          border-radius: 10px;
          margin: 20px 0;
          text-align: center;
        ">
          <p style="
            color: #4caf50;
            font-weight: bold;
            margin: 0;
          ">
            ✅ Registration Confirmed
          </p>
        </div>

        <p style="
          color: #555;
          line-height: 1.5;
        ">
          You can now log in using the email address you registered
          with and start using NextGenNutriFit.
        </p>

        <div style="text-align: center; margin: 25px 0;">
         <a href="${process.env.BASE_URL || 'http://localhost:3000'}/loginpage.html"
             style="
               display: inline-block;
               padding: 12px 25px;
               background-color: #4caf50;
               color: white;
               text-decoration: none;
               border-radius: 8px;
               font-weight: bold;
             ">
             Confirm & Login
          </a>
        </div>

        <hr style="
          border: 0;
          border-top: 1px solid #eeeeee;
          margin: 20px 0;
        ">

        <p style="
          font-size: 11px;
          color: #999;
          text-align: center;
        ">
          This is an automated confirmation email from
          NextGenNutriFit.
        </p>

      </div>
    `;

    try {
      await sendSystemMail(email, welcomeSubject, welcomeHtml);
    } catch (mailErr) {
      console.error('Welcome email failed (account was still created):', mailErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Email verified and account created successfully!'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Could not verify email and complete registration.'
    });
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



// ========================================================
// 🔄 STEP 1: REQUEST FORGOT PASSWORD - SENDS OTP EMAIL
// ========================================================
app.post('/auth/forgot-password/request', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No gym account found.' });

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes limit

    user.otp = generatedOtp;
    user.otpExpires = expirationTime;
    await user.save();

    // EMAIL 1 Content: Secure password verification layout code properties
    const otpSubject = "Reset Your NextGenNutriFit Password Key 🔑";
    const otpHtml = `
      <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #dadce0; border-radius: 16px; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #d93025; font-weight: 700; margin-bottom: 5px;">Password Reset Request</h2>
        <p style="color: #555; font-size: 14px;">Use the following secure authorization token code to reset your account credentials safely:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px dashed #d93025;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #222;">${generatedOtp}</span>
        </div>
        <p style="font-size: 11px; color: #999;">This verification code expires strictly within 5 minutes.</p>
      </div>
    `;

    // Fire Email 1 directly to user's registered inbox data mapping
    await sendSystemMail(email, otpSubject, otpHtml);

    return res.status(200).json({ success: true, message: 'Verification code generated and sent to email!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server request error.' });
  }
});


// ========================================================
// 🔑 STEP 2: VERIFY OTP AND AMEND PASSWORD - SENDS SUCCESS EMAIL
// ========================================================
app.post('/auth/forgot-password/verify', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: 'User verification mismatch.' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid validation token code. Try again.' });
    if (new Date() > user.otpExpires) return res.status(400).json({ success: false, message: 'Your validation OTP has expired!' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Save new security credentials safely
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // EMAIL 2 Content: Successful password confirmation notice template
    const successSubject = "NextGenNutriFit Security Update: Password Changed Successfully ✔️";
    const successHtml = `
      <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e0e0e0; border-radius: 16px; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #4caf50; font-weight: 700; margin-bottom: 5px;">NEXTGEN<span style="color: #212121;">NUTRIFIT</span></h2>
        <p style="font-size: 16px; color: #333; font-weight: bold;">Hello ${user.fullName || 'User'},</p>
        <p style="color: #555; line-height: 1.5;">This email confirms that your account password was changed successfully. You can now securely log back into your performance dashboard metrics view panel using your new credentials.</p>
        <div style="background-color: #fcf8e3; padding: 12px; border-radius: 8px; font-size: 13px; color: #8a6d3b; border-left: 4px solid #f0ad4e; margin: 15px 0;">
          If you did not perform this security credential change, please reach out to our administrative technical support lines immediately to freeze access tracks.
        </div>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
        <p style="font-size: 11px; color: #999;">This is an automated system transactional notice security broadcast.</p>
      </div>
    `;

    // Fire Email 2 to confirm account modification state
    await sendSystemMail(email, successSubject, successHtml);

    return res.status(200).json({ success: true, message: 'Password reset successful!' });
  } catch (error) {
    console.error("Error sending password change confirmation:", error);
    return res.status(500).json({ success: false, message: 'Server verification route processing fault.' });
  }
});


// ========================================================
// 📖 PUBLIC READ-ONLY DATA APIS
// ========================================================
app.get('/api/foods', async (req, res) => {
  try {
    const foods = await Food.find().sort({ group: 1, name: 1 });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load food data.' });
  }
});

app.get('/api/exercises', async (req, res) => {
  try {
    const exercises = await Exercise.find();
    const shaped = exercises.map(e => ({
      id: e.exerciseId,
      cat: e.cat,
      group: e.group,
      muscle: e.muscle,
      name: e.name,
      pattern: e.pattern,
      type: e.type,
      sets: e.sets,
      reps: e.reps,
      hold: e.hold,
      rest: e.rest,
      video: e.video,
      cues: e.cues
    }));
    res.json(shaped);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load exercise data.' });
  }
});

// ========================================================
// 🛡️ ADMIN AUTHENTICATION
// ========================================================
function requireAdmin(req, res, next) {
  if (!req.session.adminId) {
    return res.status(401).json({ success: false, message: 'Admin login required.' });
  }
  next();
}

app.post('/admin/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid email or password.' });

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'This account does not have admin access.' });
    }

    req.session.adminId = user._id;
    return res.status(200).json({ success: true, message: 'Admin login successful!' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during admin login.' });
  }
});

app.get('/admin/auth/me', requireAdmin, async (req, res) => {
  try {
    const admin = await User.findById(req.session.adminId).select('fullName email role');
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error loading admin profile.' });
  }
});

app.post('/admin/auth/logout', (req, res) => {
  req.session.adminId = null;
  res.json({ success: true });
});

// ========================================================
// 🛡️ ADMIN: FOOD DIARY MANAGEMENT
// ========================================================
app.get('/admin/api/foods', requireAdmin, async (req, res) => {
  const foods = await Food.find().sort({ group: 1, name: 1 });
  res.json(foods);
});

app.post('/admin/api/foods', requireAdmin, async (req, res) => {
  try {
    const food = new Food(req.body);
    await food.save();
    res.status(201).json({ success: true, food });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Could not add food item. Check the fields and try again.' });
  }
});

app.put('/admin/api/foods/:id', requireAdmin, async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!food) return res.status(404).json({ success: false, message: 'Food item not found.' });
    res.json({ success: true, food });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Could not update food item.' });
  }
});

app.delete('/admin/api/foods/:id', requireAdmin, async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: 'Food item not found.' });
    res.json({ success: true, message: 'Food item deleted.' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Could not delete food item.' });
  }
});

// ========================================================
// 🛡️ ADMIN: EXERCISE MANAGEMENT
// ========================================================
app.get('/admin/api/exercises', requireAdmin, async (req, res) => {
  const exercises = await Exercise.find().sort({ cat: 1, name: 1 });
  res.json(exercises);
});

app.post('/admin/api/exercises', requireAdmin, async (req, res) => {
  try {
    const exercise = new Exercise(req.body);
    await exercise.save();
    res.status(201).json({ success: true, exercise });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Could not add exercise. Check the fields (exerciseId must be unique) and try again.' });
  }
});

app.put('/admin/api/exercises/:id', requireAdmin, async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found.' });
    res.json({ success: true, exercise });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Could not update exercise.' });
  }
});

app.delete('/admin/api/exercises/:id', requireAdmin, async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found.' });
    res.json({ success: true, message: 'Exercise deleted.' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Could not delete exercise.' });
  }
});

// ========================================================
// 🛡️ ADMIN: USER MANAGEMENT
// ========================================================
app.get('/admin/api/users', requireAdmin, async (req, res) => {
  const users = await User.find().select('-password -otp -otpExpires').sort({ createdAt: -1 });
  res.json(users);
});

app.put('/admin/api/users/:id', requireAdmin, async (req, res) => {
  try {
    const { fullName, address, age, gender, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, address, age, gender, role },
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Could not update user.' });
  }
});

app.delete('/admin/api/users/:id', requireAdmin, async (req, res) => {
  try {
    if (req.params.id === String(req.session.adminId)) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account while logged in.' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(400).json({ success: false, message: 'Could not delete user.' });
  }
});



// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 nextgen-nutrifit Server running cleanly at http://localhost:${PORT}`));