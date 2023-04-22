const mongoose = require("mongoose");

const feeMasterSchema = new mongoose.Schema({
  master_name: {
    type: String,
    required: true,
  },
  master_amount: {
    type: Number,
    required: true,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  finance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Finance",
  },
  document_update: {
    type: Boolean,
    default: false,
  },
  master_status: {
    type: String,
    default: "Not Linked",
  },
  paid_student: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  paid_student_count: {
    type: Number,
    default: 0,
  },
  deposit_amount: {
    type: Number,
    default: 0,
  },
  refund_amount: {
    type: Number,
    default: 0,
  },
  refund_student: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  refund_student_count: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("FeeMaster", feeMasterSchema);
