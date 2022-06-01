const mongoose = require("mongoose");
const McqQuestions = require("./McqQuestions");
const SubMaster = require("./SubjectMaster")
const classMaster = require("./ClassMaster")
const student = require("./Student") 

const mcqTestSets = new mongoose.Schema({
  testSubjectMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubMaster",
  },
  testClassMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "classMaster",
  },
  testSetName: {
    type: String,
  },
  testSetQueCount: {
    type: Number,
  },
  testSetTotalMarks: {
    type: Number,
  },
  testQuestions: [
    {
      question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "McqQuestions",
      },
      mark: {
        type: Number,
      },
    },
  ],
});

const McqTestSets = mongoose.model("McqTestSets", mcqTestSets);

module.exports = McqTestSets;
