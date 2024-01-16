const mongoose = require("mongoose");

const certificateQuerySchema = new mongoose.Schema({
  query_content: {
    type: String,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  certificate_attach: {
    type: String,
  },
  certificate_status: {
    type: String,
    default: "Requested",
  },
  certificate_issued_date: {
    type: Date,
  },
  is_original: {
    type: Boolean,
    default: true,
  },
  certificate_type: {
    type: String,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  fee_receipt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeReceipt"
  }
});

module.exports = mongoose.model("CertificateQuery", certificateQuerySchema);