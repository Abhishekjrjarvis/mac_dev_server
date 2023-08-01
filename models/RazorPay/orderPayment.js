const mongoose = require("mongoose");

const orderPaymentSchema = new mongoose.Schema({
  razorpay_order_id: {
    type: String,
  },
  razorpay_payment_id: {
    type: String,
  },
  razorpay_signature: {
    type: String,
  },
  payment_module_type: {
    type: String,
  },
  payment_by_end_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  payment_to_end_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  payment_by_end_user_id_name: {
    type: String,
  },
  payment_module_id: {
    type: String,
  },
  payment_amount: {
    type: Number,
    required: true,
  },
  payment_status: {
    type: String,
  },
  payment_invoice_number: {
    type: String,
  },
  payment_mode: {
    type: String,
    default: "By Bank",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  payment_flag_by: {
    type: String,
  },
  payment_flag_to: {
    type: String,
  },
  payment_income: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Income",
  },
  payment_expense: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expense",
  },
  payment_admission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NewApplication",
  },
  payment_fee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fees",
  },
  payment_checklist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Checklist",
  },
  payment_participate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Participate",
  },
  payment_transport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
  },
  payment_finance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Finance",
  },
  payment_library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
  payment_from: {
    type: String,
  },
  payout_enable: {
    type: String,
    default: "Not Paid",
  },
  fee_receipt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeReceipt",
  },
  razor_query: [],
  // payment_expense_by_end_user_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "InstituteAdmin",
  // },
  // payment_expense_to_end_user_id: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  // },
});

module.exports = mongoose.model("OrderPayment", orderPaymentSchema);
