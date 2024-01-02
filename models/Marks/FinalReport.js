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
  createdAt: { type: Date, default: Date.now },
  totalFinalExam: { type: Number },
  totalOtherExam: { type: Number },
  totalGraceExam: { type: Number },
  totalTotalExam: { type: Number },
  totalPercentage: { type: Number },
  attendance: { type: Number, default: 0 },
  attendanceTotal: { type: Number, default: 0 },
  attendancePercentage: { type: Number, default: 0 },
  behaviourStar: { type: Number, default: 0 },
  behaviourImprovement: { type: String },
  behaviourLack: { type: String },
  passStatus: { type: String },
  totalCutoff: { type: Number },

  showGradeTotal: String,
  spi: Number,
  totalCredit: Number,
  earnedGradePoint: Number,
  totalEarnedGradePoint: Number,
  resultStatus: String,
  reportType: String,

  subjects: [
    {
      subject: { type: mongoose.Schema.Types.ObjectId },
      subjectName: { type: String },
      finalExamTotal: { type: Number },
      finalExamObtain: { type: Number },
      otherExamTotal: { type: Number },
      otherExamObtain: { type: Number },
      graceMarks: { type: Number, default: 0 },
      totalMarks: { type: Number },
      obtainTotalMarks: { type: Number },
      subjectCutoff: { type: Number },
      subjectPassStatus: { type: String },
      clearBacklog: { type: String },
      dropoutBacklog: { type: String },
      // is_backlog: {
      //   type: String,
      //   default: "No",
      // },
      course_credit: {
        type: Number,
      },

      showGrade: String,
      course_credit: Number,
      course_code: String,
      finalObtainCredit: Number,
      gradeWithCredit: Number,
      backlogCredit: Number,
      resultStatus: String,
    },
  ],
  is_grade: Boolean,
  backlog_subject: [
    {
      subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
      status: String,
      // "Again Back"
      backlog_count: {
        type: Number,
        default: 0,
      },
      examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
    },
  ],
});

module.exports = mongoose.model("FinalReport", finalReportSchema);