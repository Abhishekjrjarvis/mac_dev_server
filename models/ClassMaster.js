const mongoose = require("mongoose");

const classMasterSchema = new mongoose.Schema({
  className: { type: String, required: true },
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
  testSet: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMasterTestSet",
    },
  ],
  classCount: {
    type: Number,
    default: 0,
  },
});

const ClassMaster = mongoose.model("ClassMaster", classMasterSchema);

module.exports = ClassMaster;
