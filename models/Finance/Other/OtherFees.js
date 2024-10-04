const mongoose = require("mongoose");

const otherFeesSchema = new mongoose.Schema({
  other_fees_name: {
    type: String,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  bank_account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankAccount",
  },
  other_fees_type: {
    type: String,
  },
  fees_heads: [
    {
      head_name: { type: String },
      head_amount: { type: Number, default: 0 },
      created_at: { type: Date, default: Date.now },
      master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      is_society: { type: Boolean, default: false },
      paid_amount: {
        type: Number,
        default: 0,
      },
    },
  ],
  fee_structure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeStructure",
  },
  finance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Finance",
  },
  paid_students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  remaining_students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  payable_amount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: "Not Paid",
  },
  student_count: {
    type: Number,
    default: 0,
  },
  other_fees_disable: {
    type: String,
    default: "Enable",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  student_name: {
    type: String,
  },
  students_list: [],
  fee_receipt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeReceipt",
  },
  paid_students_count: {
    type: Number,
    default: 0,
  },
  remaining_students_count: {
    type: Number,
    default: 0,
  },
  fee_receipt_student: [
    {
      student: {
        type: String,
      },
      fee_receipt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt",
      },
      classes: {
        type: String,
      },
      batch: {
        type: String,
      },
      roll_no: {
        type: String,
      },
    },
  ],
  multiple_fee_receipt: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeReceipt",
    },
  ],
  students_data: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      fee_receipt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt",
      },
    },
  ],
});

module.exports = mongoose.model("OtherFees", otherFeesSchema);
