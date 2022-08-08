const mongoose = require("mongoose");

const subjectMarksSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, required: true },
  subjectName: { type: String, required: true },
  student: { type: mongoose.Schema.Types.ObjectId, required: true },
  marks: [
    {
      examId: { type: String, required: true },
      examName: { type: String, required: true },
      examType: { type: String, required: true },
      examWeight: { type: Number, required: true },
      totalMarks: { type: Number, required: true },
      date: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      obtainMarks: { type: Number, default: 0 },
      testSetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubjectMasterTestSet",
      },
    },
  ],
  graceMarks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("SubjectMarks", subjectMarksSchema);
