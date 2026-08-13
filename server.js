require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const session = require('express-session'); 
const nodemailer = require('nodemailer');

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
  .then(() => console.log('Connected to MongoDB successfully!'))
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
// 🚀 ROUTE 1: REGISTER USER (Sends Live Welcome Email)
// ========================================================
app.post('/auth/register', async (req, res) => {
  try {
    // 1. Swapped out "age" and added "address" from the form body request
    const { fullName, address, gender, dob, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) return res.status(400).json({ success: false, message: 'Passwords do not match!' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ success: false, message: 'Email already registered.' });

    // 2. --- AUTOMATIC AGE CALCULATION LOGIC ---
    const birthDate = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    // Adjust age backward by 1 if their birthday hasn't happened yet this calendar year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Saved both the dynamic calculated age numerical mapping and the incoming address string into MongoDB
    const newUser = new User({ 
        fullName, 
        address, 
        age: calculatedAge, 
        gender, 
        dob, 
        email, 
        password: hashedPassword 
    });
    await newUser.save();

    // LIVE EMAIL: Custom layout sent directly to the newly registered email address
    const welcomeSubject = "Welcome to NextGenNutriFit! 🎉";
    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #e0e0e0; border-radius: 16px; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #4caf50; font-weight: 700; margin-bottom: 5px;">NEXTGEN<span style="color: #212121;">NUTRIFIT</span></h2>
        <p style="font-size: 16px; color: #333; font-weight: bold;">Hello ${fullName},</p>
        <p style="color: #555; line-height: 1.5;">Your profile has been created successfully! Welcome to the next generation of performance training, dynamic nutrition mapping, and fitness metrics tracking.</p>
        <p style="color: #555;">Log into your dashboard today to set your health milestones!</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;">
        <p style="font-size: 11px; color: #999;">This is an automated system welcome confirmation letter.</p>
      </div>
    `;

    // Trigger email using the dynamic 'email' variable submitted by the form
    await sendSystemMail(email, welcomeSubject, welcomeHtml);

    return res.status(201).json({ success: true, message: 'Account created successfully!' });
  } catch (error) {
    console.error(error);
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

// // ========================================================
// // 🔄 ROUTE 2: REQUEST FORGOT PASSWORD LIVE OTP CODE
// // ========================================================
// app.post('/auth/forgot-password/request', async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ success: false, message: 'No gym account found.' });

//     const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expirationTime = new Date(Date.now() + 5 * 60 * 1000); 

//     user.otp = generatedOtp;
//     user.otpExpires = expirationTime;
//     await user.save();

//     // LIVE EMAIL: Sends the generated OTP directly to the user who requested it
//     const otpSubject = "Reset Your NextGenNutriFit Password Key 🔑";
//     const otpHtml = `
//       <div style="font-family: Arial, sans-serif; padding: 25px; border: 1px solid #dadce0; border-radius: 16px; max-width: 480px; margin: 0 auto;">
//         <h2 style="color: #d93025; font-weight: 700; margin-bottom: 5px;">Password Reset Request</h2>
//         <p style="color: #555; font-size: 14px;">Use the following secure authorization token code to reset your account credentials safely:</p>
//         <div style="background-color: #f8f9fa; padding: 15px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px dashed #d93025;">
//           <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #222;">${generatedOtp}</span>
//         </div>
//         <p style="font-size: 11px; color: #999;">This verification code expires strictly within 5 minutes.</p>
//       </div>
//     `;

//     await sendSystemMail(email, otpSubject, otpHtml);
//     return res.status(200).json({ success: true, message: 'Verification code generated and sent to email!' });

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ success: false, message: 'Server request error.' });
//   }
// });

// // VERIFY OTP AND AMEND PASSWORD
// app.post('/auth/forgot-password/verify', async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) return res.status(404).json({ success: false, message: 'User verification mismatch.' });
//     if (!user.otp || user.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid validation token code. Try again.' });
// if (new Date() > user.otpExpires) return res.status(400).json({ success: false, message: 'Your validation OTP has expired!' });
// const salt = await bcrypt.genSalt(10);
// const hashedPassword = await bcrypt.hash(newPassword, salt);user.password = hashedPassword;user.otp = null;
// user.otpExpires = null;await user.save();return res.status(200).json({ success: true, message: 'Password reset successful!' });
// } 
// catch (error) {return res.status(500).json({ success: false, message: 'Server verification route processing fault.' });}});


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




// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 nextgen-nutrifit Server running cleanly at http://localhost:${PORT}`));