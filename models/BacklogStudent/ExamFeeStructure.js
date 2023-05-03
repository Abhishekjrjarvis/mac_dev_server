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
  paid_student: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      amount: {
        type: Number,
        default: 0,
      },
      created_at: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        default: "Not Paid",
      },
    },
  ],
  paid_student_count: {
    type: Number,
    default: 0,
  },
  total_paid_collection: {
    type: Number,
    default: 0,
  },
  exam_fee_status: {
    type: String,
    default: "Not Linked",
  },
});

module.exports = mongoose.model("ExamFeeStructure", examFeeStructureSchema);
