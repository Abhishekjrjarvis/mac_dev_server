const mongoose = require("mongoose");

const examFeeStructureSchema = new mongoose.Schema({
  exam_fee_type: {
    type: String,
    required: true,
  },
  exam_fee_amount: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  exam_fee_status: {
    type: String,
    default: "Not Linked",
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
  },
});

module.exports = mongoose.model("ExamFeeStructure", examFeeStructureSchema);
