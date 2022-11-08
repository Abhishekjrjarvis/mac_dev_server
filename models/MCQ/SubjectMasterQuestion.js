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
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectQuestion",
    },
  ],
  questionCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "SubjectMasterQuestion",
  subjectMasterQuestionShcema
);
