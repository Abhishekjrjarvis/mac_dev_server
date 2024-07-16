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
      studenttestset: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentTestSet",
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
  testset: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectMasterTestSet",
  },
  take_test: {
    type: String,
    default: "1",
  },
  mcq_test_date: {
    type: Date,
  },
  mcq_test_from: {
    type: String,
  },
  mcq_test_to: {
    type: String,
  },
  mcq_test_duration: {
    type: Number,
  },
  old_take_test: [
    {
      take_test: {
        type: String,
        default: "1",
      },
      mcq_test_date: {
        type: Date,
      },
      mcq_test_from: {
        type: String,
      },
      mcq_test_to: {
        type: String,
      },
      mcq_test_duration: {
        type: Number,
      },
    },
  ],
  student_notify: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentNotification",
    },
  ],
});

module.exports = mongoose.model(
  "SubjectInternalEvaluationTest",
  subjectInternalEvaluationTestSchema
);

