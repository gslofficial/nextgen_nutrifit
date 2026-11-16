const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true, default: '' },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  dob: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profilePicture: { type: String, default: '', maxlength: 2200000 },
  healthLogs: [{
    weight: Number, height: Number, calories: Number, protein: Number,
    fats: Number, carbs: Number, fiber: Number,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
