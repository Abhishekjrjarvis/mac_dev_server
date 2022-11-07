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
  isUniversal: {
    type: Boolean,
    default: false,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  // universal_activate_question:[
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "InstituteAdmin",
  //   }
  // ],
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
