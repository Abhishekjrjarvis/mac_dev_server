const mongoose = require("mongoose");

const paySlipSchema = new mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
    },
    payroll: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PayrollModule"
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    salary_structure: [],
    month: {
        type: String
    },
    year: {
        type: String
    },
    net_payable: {
        type: Number,
        default: 0
    },
    attendance_stats: [],
    fee_receipt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt"
    },
    form_a: {
        type: String
    },
    form_b: {
        type: String
    },
    key: {
        type: String
    }
});

module.exports = mongoose.model("PaySlip", paySlipSchema);
