const mongoose = require("mongoose");

const feeStructureSchema = new mongoose.Schema({
  category_master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeCategory",
    // required: true,
  },
  class_master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClassMaster",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  batch_master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  finance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Finance",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
  },
  structure_name: {
    type: String,
  },
  unique_structure_name: {
    type: String,
  },
  applicable_fees: {
    type: Number,
    default: 0,
  },
  one_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  two_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  three_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  four_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  five_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  six_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  seven_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  eight_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  nine_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  ten_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  eleven_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  tweleve_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  total_installments: {
    type: String,
  },
  total_admission_fees: {
    type: Number,
    default: 0,
  },
  due_date: {
    type: String,
  },
  applicable_fees_heads: [
    {
      head_name: { type: String },
      head_amount: { type: Number, default: 0 },
      created_at: { type: Date, default: Date.now },
      master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
    },
  ],
  government_fees_heads: [
    {
      head_name: { type: String },
      head_amount: { type: Number, default: 0 },
      created_at: { type: Date, default: Date.now },
      master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
    },
  ],
  applicable_fees_heads_count: {
    type: Number,
    default: 0,
  },
  government_fees_heads_count: {
    type: Number,
    default: 0,
  },
  document_update: {
    type: Boolean,
    default: false,
  },
  migrate_to: [],
  structure_month: {
    type: Number,
    default: 12,
  },
  unit_master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HostelUnit",
  },
  vehicle_master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
  },
  transport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transport",
  },
  fee_structure_code: {
    type: String,
    unique: true
  }
});

module.exports = mongoose.model("FeeStructure", feeStructureSchema);
