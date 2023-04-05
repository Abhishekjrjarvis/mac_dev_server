const mongoose = require("mongoose");

const payMasterSchema = new mongoose.Schema({
  pay_month: { type: Date },
  pay_amount: { type: Number, default: 0 },
  pay_status: { type: String, default: "Not Paid" },
  pay_fee_receipt: { type: mongoose.Schema.Types.ObjectId, ref: "FeeReceipt" },
  created_at: { type: Date, default: Date.now },
  pay_staff_collection: [
    {
      amount: { type: Number, default: 0 },
      emp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payroll",
      },
    },
  ],
  pay_staff_collection_count: {
    type: Number,
    default: 0,
  },
  payroll_master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PayrollMaster",
  },
  finance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Finance",
  },
});

module.exports = mongoose.model("PayMaster", payMasterSchema);
