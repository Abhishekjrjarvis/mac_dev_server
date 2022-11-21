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
    type: String,
  },
  payment_to_end_user_id: {
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
    type: Number,
    default: 0,
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
});

module.exports = mongoose.model("OrderPayment", orderPaymentSchema);
