const mongoose = require("mongoose");

const remainingFeeListSchema = new mongoose.Schema({
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NewApplication",
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch"
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
      refund_status: { type: String , default: "Not Refunded"}
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
});

module.exports = mongoose.model("RemainingList", remainingFeeListSchema);
