const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  id: String,
  user_id: String,
  institute_id: String,
  file_name: String,
  file_url: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Certificate", certificateSchema);