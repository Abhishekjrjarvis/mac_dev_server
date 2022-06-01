const mongoose = require("mongoose");

const Subject = require("./Subject");
const InstituteAdmin = require("./InstituteAdmin");
const Batch = require("./Batch");
const Department = require("./Department");
const McqTestSets = require("./McqTestSets");
const McqQuestions = require("./McqQuestions");
const subjectMasterSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },

  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
  subjectTestSets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "McqTestSets",
    },
  ],
  subjectQuestions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "McqQuestions",
    },
  ],
});

const SubjectMaster = mongoose.model("SubjectMaster", subjectMasterSchema);

module.exports = SubjectMaster;
