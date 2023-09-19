const mongoose = require("mongoose");

const feeReceiptSchema = new mongoose.Schema({
  fee_payment_mode: {
    type: String,
    required: true,
  },
  fee_payment_amount: {
    type: Number,
    default: 0,
    required: true,
  },
  fee_transaction_date: {
    type: Date,
    required: true,
  },
  fee_payment_acknowledge: {
    type: String,
  },
  fee_bank_name: {
    type: String,
  },
  fee_bank_holder: {
    type: String,
  },
  fee_utr_reference: {
    type: String,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NewApplication",
  },
  unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HostelUnit",
  },
  invoice_count: {
    type: String,
    unique: true,
  },
  app_status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Status",
  },
  re_apply: { type: Boolean, default: false },
  refund_status: {
    type: String,
    default: "No Refund",
  },
  reason: {
    type: String,
  },
  fee_payment_type: {
    type: String,
  },
  app_renewal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Renewal",
  },
  // applicable_fee: {
  //   type: Number,
  //   default: 0,
  // },
  // paid_fee: {
  //   type: Number,
  //   default: 0,
  // },
  finance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Finance",
  },
  fee_request_remain_card: {
    type: String,
  },
  fee_master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeMaster",
  },
  fee_flow: {
    type: String,
  },
  fee_heads: [
    {
      head_id: { type: String },
      head_name: { type: String },
      paid_fee: { type: Number, default: 0 },
      applicable_fee: { type: Number, default: 0 },
      remain_fee: { type: Number, default: 0 },
      created_at: { type: Date, default: Date.now },
      fee_structure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeStructure",
      },
      master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      original_paid: { type: Number, default: 0 },
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
  pay_master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PayMaster",
  },
  paid_by_student: {
    type: Number,
    default: 0,
  },
  paid_by_government: {
    type: Number,
    default: 0,
  },
  order_history: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OrderPayment",
  },
  internal_fees: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InternalFees",
  },
  set_off_status: {
    type: String,
    default: "Not Set off",
  },
  receipt_status: {
    type: String,
  },
  receipt_generated_from: {
    type: String,
  },
  receipt_edited_status: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("FeeReceipt", feeReceiptSchema);
