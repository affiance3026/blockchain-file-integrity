const mongoose = require("mongoose");

const instituteSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  password: String,
  cid: String,
  otp: String,
  otpExpires: Date,
  otpVerified: {
  type: Boolean,
  default: false
  },
  status: {
    type: String,
    default: "not raised"
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Institute", instituteSchema);