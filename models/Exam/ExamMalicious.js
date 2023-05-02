const mongoose = require("mongoose");

const examMalicious = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  reason: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  seating: { type: mongoose.Schema.Types.ObjectId, ref: "Seating" },
});

module.exports = mongoose.model("ExamMalicious", examMalicious);
