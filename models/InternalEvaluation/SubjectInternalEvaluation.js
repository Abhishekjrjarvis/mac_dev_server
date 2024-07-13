const mongoose = require("mongoose");
const subjectInternalEvaluationSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  out_of: Number,
  internal_evaluation_test: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectInternalEvaluationTest",
    },
  ],
  student_list: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      obtain_marks: {
        type: Number,
        default: 0,
      },
    },
  ],
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "SubjectInternalEvaluation",
  subjectInternalEvaluationSchema
);