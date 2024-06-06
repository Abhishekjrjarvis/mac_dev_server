const mongoose = require("mongoose");

const bankAccountSchema = new mongoose.Schema({
  finance_bank_account_number: {
    type: String,
  },
  finance_bank_name: {
    type: String,
  },
  finance_bank_account_name: {
    type: String,
  },
  finance_bank_ifsc_code: {
    type: String,
  },
  finance_bank_branch_address: {
    type: String,
  },
  finance_bank_upi_id: {
    type: String,
  },
  finance_bank_upi_qrcode: {
    type: String,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  departments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
  transport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transport",
  },
  admission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admission",
  },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
  finance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Finance",
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  due_repay: {
    type: Number,
    default: 0,
  },
  total_repay: {
    type: Number,
    default: 0,
  },
  collect_online: {
    type: Number,
    default: 0,
  },
  collect_offline: {
    type: Number,
    default: 0,
  },
  bank_account_type: {
    type: String
  },
  day_book: [
    {
      excel_file: { type: String },
      excel_file_name: { type: String },
      created_at: { type: Date, default: Date.now },
    },
    ],
});

module.exports = mongoose.model("BankAccount", bankAccountSchema);
