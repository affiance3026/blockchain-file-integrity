const mongoose = require("mongoose");

const accessRequestSchema = new mongoose.Schema({
  id: String,
  certificate_id: String,
  verifier_id: String,
  user_id: String,
  status: {
    type: String,
    default: "pending"
  },
  from_time: Date,
  to_time: Date,
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("AccessRequest", accessRequestSchema);