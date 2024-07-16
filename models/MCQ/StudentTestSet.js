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
  classMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClassMaster",
    required: true,
  },
  subjectMasterTestSet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectMasterTestSet",
    required: true,
  },
  allotedTestSet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AllotedTestSet",
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
    type: Number,
  },
  testTotalQuestion: {
    type: Number,
  },
  testTotalNumber: {
    type: Number,
  },
  testObtainMarks: {
    type: Number,
    default: 0,
  },
  questions: [
    {
      questionSNO: {
        type: String,
        required: true,
      },
      questionNumber: {
        type: Number,
        required: true,
      },
      questionDescription: {
        type: String,
      },
      questionImage: [
        {
          documentType: {
            type: String,
          },
          documentName: {
            type: String,
          },
          documentSize: {
            type: String,
          },
          documentKey: {
            type: String,
          },
          documentEncoding: {
            type: String,
          },
        },
      ],
      options: [
        {
          option: { type: String },
          optionNumber: { type: String },
          image: { type: String },
        },
      ],
      givenAnswer: [
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
      answerImage: [
        {
          documentType: {
            type: String,
          },
          documentName: {
            type: String,
          },
          documentSize: {
            type: String,
          },
          documentKey: {
            type: String,
          },
          documentEncoding: {
            type: String,
          },
        },
      ],
      isUniversal: {
        type: Boolean,
        default: false,
      },
    },
  ],
  testSetAccess: {
    type: Boolean,
    default: false,
  },
  testSetLeftTime: {
    type: Number,
  },
  testSetComplete: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  internal_evaluation_test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectInternalEvaluationTest",
  },
});

module.exports = mongoose.model("StudentTestSet", studentTestSetShcema);
