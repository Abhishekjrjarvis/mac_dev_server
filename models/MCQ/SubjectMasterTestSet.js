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
  isUniversal: {
    type: Boolean,
    default: false,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  testName: {
    type: String,
  },
  testSubject: {
    type: String,
    required: true,
  },
  allotedTestSet: [
    { type: mongoose.Schema.Types.ObjectId, ref: "AllotedTestSet" },
  ],

  testTotalQuestion: {
    type: Number,
  },
  testTotalNumber: {
    type: Number,
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectQuestion",
    },
  ],
  assignSubject: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "SubjectMasterTestSet",
  subjectMasterTestSetShcema
);
