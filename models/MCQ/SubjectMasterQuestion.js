const mongoose = require("mongoose");

const subjectMasterQuestionShcema = new mongoose.Schema({
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
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model(
  "SubjectMasterQuestion",
  subjectMasterQuestionShcema
);
