const mongoose = require("mongoose");

const allotedTestSetSchema = new mongoose.Schema({
  testExamName: {
    type: String,
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
  testTotalNumber: {
    type: Number,
  },
  assignTestSubject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  subjectMasterTestSet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectMasterTestSet",
  },
  assignStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AllotedTestSet", allotedTestSetSchema);
