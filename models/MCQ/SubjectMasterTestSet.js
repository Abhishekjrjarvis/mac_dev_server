const mongoose = require("mongoose");

const subjectMasterTestSetShcema = new mongoose.Schema({
  subjectMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectMaster",
    required: true,
  },
  testName: {
    type: String,
  },
  testExamName: {
    type: String,
  },
  testSubject: {
    type: String,
    required: true,
  },
  testDate: {
    type: String,
  },
  testStart: {
    type: String,
  },
  testEnd: {
    type: String,
  },
  testDuration: {
    type: String,
  },
  testTotalQuestion: {
    type: Number,
  },
  testTotalNumber: {
    type: Number,
  },
  questions: [
    {
      questionSNO: {
        type: Number,
      },
      questionNumber: {
        type: Number,
        required: true,
      },
      questionDescription: {
        type: String,
      },
      questionImage: {
        type: String,
      },
      options: [{ type: String }],
      correctAnswer: {
        type: String,
        required: true,
      },
      answerDescription: {
        type: String,
      },
      answerImage: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model(
  "SubjectMasterTestSet",
  subjectMasterTestSetShcema
);
