const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
  staff_salary_month: {
    type: Number,
    default: 0,
  },
  staff_total_paid_leaves: {
    type: Number,
    default: 0,
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  pay_master_heads_particular: [
    {
      master_name: { type: String },
      master_amount: { type: Number, default: 0 },
      master_status: { type: String },
      created_at: { type: Date, default: Date.now },
      master_id: { type: mongoose.Schema.Types.ObjectId, ref: "PayrollMaster" },
    },
  ],
  pay_master_heads_particular_count: {
    type: Number,
    default: 0,
  },
  pay_master_heads_deduction: [
    {
      master_name: { type: String },
      master_amount: { type: Number, default: 0 },
      master_status: { type: String },
      created_at: { type: Date, default: Date.now },
      master_id: { type: mongoose.Schema.Types.ObjectId, ref: "PayrollMaster" },
    },
  ],
  pay_master_heads_deduction_count: {
    type: Number,
    default: 0,
  },
  pay_slip: [
    {
      month: { type: Date },
      attendence: { type: Number, default: 0 },
      total_leaves: { type: Number, default: 0 },
      paid_leaves: { type: Number, default: 0 },
      payment_mode: { type: String },
      purpose: { type: String },
      amount: { type: Number, default: 0 },
      paid_to: { type: String },
      message: { type: String },
      is_paid: { type: String, default: "Not Paid" },
      gross_salary: { type: Number, default: 0 },
      net_total: { type: Number, default: 0 },
      month_master: [
        {
          month_master_name: { type: String },
          month_master_amount: { type: Number, default: 0 },
          created_at: { type: Date, default: Date.now },
          month_master_status: { type: String },
          month_master_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PayrollMaster",
          },
        },
      ],
    },
  ],
});

module.exports = mongoose.model("Payroll", payrollSchema);
