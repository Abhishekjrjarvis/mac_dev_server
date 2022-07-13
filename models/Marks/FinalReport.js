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
  attendance: { type: Number, required: true },
  attendanceTotal: { type: Number, required: true },
  attendancePercentage: { type: Number, required: true },
  behaviourStar: { type: Number, required: true },
  behaviourImprovement: { type: String, required: true },
  behaviourLack: { type: String, required: true },
  subjects: [
    {
      subject: { type: mongoose.Schema.Types.ObjectId, required: true },
      subjectName: { type: String, required: true },
      finalExamTotal: { type: Number, required: true },
      finalExamObtain: { type: Number, required: true },
      otherExamTotal: { type: Number, required: true },
      otherExamObtain: { type: Number, required: true },
      graceMarks: { type: Number, required: true },
      totalMarks: { type: Number, required: true },
      obtainTotalMarks: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("FinalReport", finalReportSchema);
