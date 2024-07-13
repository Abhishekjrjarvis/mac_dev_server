const mongoose = require("mongoose");
const subjectInternalEvaluationTestSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  test_type: String,
  out_of: Number,
  conversion_rate: String,
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
  internal_evaluation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectInternalEvaluation",
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
  "SubjectInternalEvaluationTest",
  subjectInternalEvaluationTestSchema
);