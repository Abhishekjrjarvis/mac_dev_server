const mongoose = require("mongoose");

const renewalSchema = new mongoose.Schema({
  renewal_status: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  renewal_start: {
    type: Date,
  },
  renewal_end: {
    type: Date,
  },
  renewal_student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  renewal_application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NewApplication",
  },
  renewal_hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
  },
  renewal_unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HostelUnit",
  },
  renewal_notification_status: {
    type: String,
    default: "Not Requested",
  },
  sub_payment_mode: {
    type: String,
  },
  receipt_status: {
    type: String,
  },
  receipt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeReceipt",
  },
  payMode: { type: String },
});

module.exports = mongoose.model("Renewal", renewalSchema);
