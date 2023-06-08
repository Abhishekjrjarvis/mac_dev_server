const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema({
  content: { type: String, required: true },
  status: { type: String },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NewApplication",
  },
  hostelUnit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HostelUnit",
  },
  payMode: { type: String },
  isPaid: { type: String, default: "Not Paid" },
  for_selection: { type: String },
  studentId: { type: String },
  admissionFee: { type: Number },
  see_secure: { type: Boolean, default: false },
  oneInstallments: { type: Number },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  feeStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeStructure",
  },
  hostel_fee_structure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeStructure",
  },
  finance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Finance",
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
  document_visible: {
    type: Boolean,
    default: false,
  },
  flow_status: {
    type: String,
    default: "Admission Application",
  },
  for_docs: {
    type: String,
  },
  docs_status: {
    type: String,
  },
  bank_account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankAccount",
  },
});

module.exports = mongoose.model("Status", statusSchema);
