const mongoose = require("mongoose");

const previousSchema = new mongoose.Schema({
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  behaviour: { type: mongoose.Schema.Types.ObjectId, ref: "Behaviour" },
  subjectMarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMarks",
    },
  ],
  exams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
  ],
  finalReport: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinalReport",
    },
  ],
  testSet: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentTestSet",
    },
  ],
});

module.exports = mongoose.model("StudentPreviousData", previousSchema);
