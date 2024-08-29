const mongoose = require("mongoose");

const subjectQuestionSchema = new mongoose.Schema({
  questionSNO: {
    type: String,
    required: true,
  },
  questionNumber: {
    type: Number,
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
  relatedSubject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectMasterQuestion",
  },
  assignTestSet: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMasterTestSet",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SubjectQuestion", subjectQuestionSchema);
