const mongoose = require("mongoose");

const finalReportSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  createAt: { type: Date, default: Date.now },
  totalFinalExam: { type: Number, required: true },
  totalOtherExam: { type: Number, required: true },
  totalGraceExam: { type: Number, required: true },
  totalTotalExam: { type: Number, required: true },
  totalPercentage: { type: Number, required: true },
  attendance: { type: Number, default: 0 },
  attendanceTotal: { type: Number, default: 0 },
  attendancePercentage: { type: Number, default: 0 },
  behaviourStar: { type: Number, default: 0 },
  behaviourImprovement: { type: String },
  behaviourLack: { type: String },
  passStatus: { type: String },
  totalCutoff: { type: Number },
  subjects: [
    {
      subject: { type: mongoose.Schema.Types.ObjectId, required: true },
      subjectName: { type: String, required: true },
      finalExamTotal: { type: Number, required: true },
      finalExamObtain: { type: Number, required: true },
      otherExamTotal: { type: Number, required: true },
      otherExamObtain: { type: Number, required: true },
      graceMarks: { type: Number, default: 0 },
      totalMarks: { type: Number, required: true },
      obtainTotalMarks: { type: Number, required: true },
      subjectCutoff: { type: Number },
      subjectPassStatus: { type: String },
    },
  ],
});

module.exports = mongoose.model("FinalReport", finalReportSchema);
