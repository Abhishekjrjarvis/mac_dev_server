const mongoose = require("mongoose");

const subjectMasterTestSetShcema = new mongoose.Schema({
  subjectMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectMaster",
    required: true,
  },
  classMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClassMaster",
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
        type: String,
      },
      questionNumber: {
        type: Number,
        required: true,
      },
      questionDescription: {
        type: String,
      },
      questionImage: [],
      options: [
        {
          option: { type: String },
          optionNumber: { type: String },
          image: { type: String },
        },
      ],
      correctAnswer: [
        {
          option: { type: String },
          optionNumber: { type: String },
          image: { type: String },
        },
      ],
      answerDescription: {
        type: String,
      },
      answerImage: [],
      createdAt: {
        type: Date,
      },
    },
  ],
});

module.exports = mongoose.model(
  "SubjectMasterTestSet",
  subjectMasterTestSetShcema
);
