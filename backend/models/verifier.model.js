const mongoose = require("mongoose");

const verifierSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  password: String,
  otp: String,
  otpExpires: Date,
  otpVerified: {
  type: Boolean,
  default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Verifier", verifierSchema);