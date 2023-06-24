const mongoose = require("mongoose");

const internalFeeSchema = new mongoose.Schema({
  created_at: {
    type: Date,
    default: Date.now,
  },
  internal_fee_type: {
    type: String,
  },
  internal_fee_amount: {
    type: Number,
    default: 0,
  },
  internal_fee_reason: {
    type: String,
  },
  internal_fee_status: {
    type: String,
    default: "Not Paid",
  },
  internal_fee_exempt_status: {
    type: String,
    default: "Not Exempted",
  },
  fee_receipt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeReceipt",
  },
  fees: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fees",
  },
  checklist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Checklist",
  },
  exam_structure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExamFeeStructure",
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
  },
});

module.exports = mongoose.model("InternalFees", internalFeeSchema);
