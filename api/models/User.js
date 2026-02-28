const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PLAN_LIMITS = {
  free: 50,
  basic: 1000,
  pro: 10000,
  enterprise: 50000
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  plan: {
    type: String,
    enum: ['free', 'basic', 'pro', 'enterprise'],
    default: 'free'
  },
  planExpiresAt: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  requestsToday: {
    type: Number,
    default: 0
  },
  lastRequestReset: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getDailyLimit = function() {
  return PLAN_LIMITS[this.plan] || PLAN_LIMITS.free;
};

userSchema.statics.PLAN_LIMITS = PLAN_LIMITS;

module.exports = mongoose.model('User', userSchema);
