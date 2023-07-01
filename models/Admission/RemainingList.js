const mongoose = require("mongoose");

const remainingFeeListSchema = new mongoose.Schema({
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NewApplication",
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  applicable_fee: { type: Number, default: 0 },
  remaining_fee: { type: Number, default: 0 },
  exempted_fee: { type: Number, default: 0 },
  paid_fee: { type: Number, default: 0 },
  refund_fee: { type: Number, default: 0 },
  remaining_array: [
    {
      appId: { type: mongoose.Schema.Types.ObjectId, ref: "NewApplication" },
      remainAmount: { type: Number, default: 0 },
      status: { type: String, default: "Not Paid" },
      instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstituteAdmin",
      },
      installmentValue: { type: String },
      isEnable: { type: Boolean, default: false },
      mode: { type: String },
      originalFee: { type: Number, default: 0 },
      dueDate: { type: String },
      exempt_status: { type: String, default: "Not Exempted" },
      fee_receipt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt",
      },
      refund_status: { type: String, default: "Not Refunded" },
      reject_reason: { type: String },
    },
  ],
  fee_receipts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeReceipt",
    },
  ],
  status: { type: String, default: "Not Paid" },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  fee_structure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeStructure",
  },
  remark: {
    type: String,
  },
  remaining_flow: {
    type: String,
    default: "Admission Application",
  },
  renewal_start: {
    type: Date,
  },
  renewal_end: {
    type: Date,
  },
  paid_by_student: {
    type: Number,
    default: 0,
  },
  paid_by_government: {
    type: Number,
    default: 0,
  },
  access_mode_card: {
    type: String,
  },
  set_off: {
    type: Number,
    default: 0,
  },
  setOffPrice: {
    type: Number,
    default: 0,
  },
  card_type: {
    type: String,
    default: "Normal",
  },
  scholar_ship_number: {
    type: String,
  },
  active_payment_type: {
    type: String,
    default: "No Process",
  },
  drop_status: {
    type: String,
    default: "Disable",
  },
  already_made: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("RemainingList", remainingFeeListSchema);
