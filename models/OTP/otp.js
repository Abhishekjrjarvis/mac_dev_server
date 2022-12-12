const mongoose = require("mongoose");

const otpCodeSchema = new mongoose.Schema({
  otp_number: {
    type: String,
    required: true,
  },
  otp_code: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("OTPCode", otpCodeSchema);
