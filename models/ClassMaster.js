const mongoose = require("mongoose");

const classMasterSchema = new mongoose.Schema({
  className: { type: String, required: true },

  ///depricaited this not use
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
      ref: "Class",
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
  classCount: {
    type: Number,
    default: 0,
  },
});

const ClassMaster = mongoose.model("ClassMaster", classMasterSchema);

module.exports = ClassMaster;
