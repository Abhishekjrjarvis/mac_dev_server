const mongoose = require("mongoose");
const Department = require("./Department");

const InstituteAdmin = require("./InstituteAdmin");
const McqQuestions = require("./McqQuestions")
const McqTestSets = require("./McqTestSets")

const classMasterSchema = new mongoose.Schema({
  className: { type: String, required: true },
  classTitle: { type: String },

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },

  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  classDivision: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
  classQuestions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "McqQuestions",
    },
  ],
  classTestSets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "McqTestSets",
    },
  ],
});

const ClassMaster = mongoose.model("ClassMaster", classMasterSchema);

module.exports = ClassMaster;
