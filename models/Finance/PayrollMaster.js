const mongoose = require("mongoose");

const payrollMasterSchema = new mongoose.Schema({
  payroll_head_name: {
    type: String,
    required: true,
  },
  payroll_head_type: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  payroll_month_collection: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PayMaster",
    },
  ],
  finance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Finance",
  },
});

module.exports = mongoose.model("PayrollMaster", payrollMasterSchema);
