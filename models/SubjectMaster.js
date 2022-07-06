const mongoose = require("mongoose");

const subjectMasterSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
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
  subjectCount: {
    type: Number,
    default: 0,
  },
});

const SubjectMaster = mongoose.model("SubjectMaster", subjectMasterSchema);

module.exports = SubjectMaster;
