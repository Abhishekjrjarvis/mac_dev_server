const mongoose = require("mongoose");

const studentTestSetShcema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  subjectMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectMaster",
    required: true,
  },
  testExamName: {
    type: String,
    required: true,
  },
  testSubject: {
    type: String,
    required: true,
  },
  testDate: {
    type: String,
    required: true,
  },
  testStart: {
    type: String,
    required: true,
  },
  testEnd: {
    type: String,
    required: true,
  },
  testDuration: {
    type: String,
    required: true,
  },
  testTotalQuestion: {
    type: Number,
    required: true,
  },
  testTotalNumber: {
    type: Number,
    required: true,
  },
  testObtainMarks: {
    type: Number,
    default: 0,
  },
  questions: [
    {
      questionSNO: {
        type: Number,
        required: true,
      },
      questionNumber: {
        type: Number,
        required: true,
      },
      questionDescription: {
        type: String,
        required: true,
      },
      questionImage: {
        type: String,
      },
      options: [{ type: String }],
      givenAnswer: {
        type: String,
      },
      correctAnswer: {
        type: String,
      },
      answerDescription: {
        type: String,
      },
      answerImage: {
        type: String,
      },
    },
  ],
  studentTestSet: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("StudentTestSet", studentTestSetShcema);
