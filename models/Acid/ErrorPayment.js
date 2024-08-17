const mongoose = require("mongoose")

const errorPaymentSchema = new mongoose.Schema({
    error_flow: { type: String },
    error_student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    error_module: { type: String },
    error_order_id: { type: String },
    error_message: { type: String },
    error_payment_card: { type: mongoose.Schema.Types.ObjectId, ref: "RemainingList" },
    created_at: { type: Date, default: Date.now },
    error_status: { type: String, default: "GENERATED" },
    error_amount: { type: Number, default: 0 },
    error_amount_charges: { type: Number, default: 0 },
    error_paid_to: { type: String },
    error_status_id: { type: String },
    error_type: { type: String },
    error_receipt: { type: mongoose.Schema.Types.ObjectId, ref: "FeeReceipt" },
    error_op: { type: mongoose.Schema.Types.ObjectId, ref: "OrderPayment"}
})

module.exports = mongoose.model("ErrorPayment", errorPaymentSchema)