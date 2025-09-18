const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");


const userSchema = new mongoose.Schema({
 
  fullName: {
    type: String,
    required: [true, 'Full name is required'], 
    trim: true
  },
  
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email",
    ],
  },
  
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, "Password must be at least 8 characters long"],
    select: false
  },

     // Profile photo URL
     photo: {
      type: String,
      default: null, // or provide a default placeholder URL
    },
  
  // From Sign Up screen - optional field
  referralCode: {
    type: String,
    trim: true
  },
  
  // For Google/Apple login
  googleId: String,
  appleId: String,
  
  // For password reset functionality
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },

  
}, {
  timestamps: true
});


userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString("hex");
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};
// Add this to your userSchema methods
userSchema.methods.toAuthJSON = function() {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    username: this.username,
    googleId: this.googleId,
    appleId: this.appleId,
    referralCode: this.referralCode
  };
};

module.exports = mongoose.model('User', userSchema);