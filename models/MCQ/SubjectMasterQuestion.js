const mongoose = require("mongoose");

const subjectMasterQuestionShcema = new mongoose.Schema({
  subjectMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectMaster",
    required: true,
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
  "SubjectMasterQuestion",
  subjectMasterQuestionShcema
);
