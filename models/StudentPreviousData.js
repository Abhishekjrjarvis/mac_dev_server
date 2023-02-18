const mongoose = require("mongoose");

const previousSchema = new mongoose.Schema({
  studentCode: { type: String },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  studentROLLNO: { type: String },
  behaviour: { type: mongoose.Schema.Types.ObjectId, ref: "Behaviour" },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  notification: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentNotification",
    },
  ],

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
  finalReportStatus: { type: String, default: "No" },
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
  assignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentAssignment",
    },
  ],

  totalAssignment: {
    type: Number,
    default: 0,
  },
  submittedAssignment: {
    type: Number,
    default: 0,
  },

  incompletedAssignment: {
    type: Number,
    default: 0,
  },
  completedAssignment: {
    type: Number,
    default: 0,
  },

  studentFee: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  attendDate: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendenceDate",
    },
  ],

  checklist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checklist",
    },
  ],
  onlineFeeList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  onlineCheckList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checklist",
    },
  ],
  offlineFeeList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  offlineCheckList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checklist",
    },
  ],
  complaints: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
  ],
  studentChecklist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checklist",
    },
  ],
  leave: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentLeave",
    },
  ],
  transfer: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentTransfer",
    },
  ],

  studentExemptFee: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  exemptFeeList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  studentRemainingFeeCount: {
    type: Number,
    default: 0,
  },
  studentPaidFeeCount: {
    type: Number,
    default: 0,
  },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
  studentAdmissionDate: {
    type: String,
  },
  borrow: [{ type: mongoose.Schema.Types.ObjectId, ref: "IssueBook" }],
  deposite: [{ type: mongoose.Schema.Types.ObjectId, ref: "CollectBook" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sportEventCount: {
    type: Number,
    default: 0,
  },
  admissionRemainFeeCount: {
    type: Number,
    default: 0,
  },
  admissionPaymentStatus: [
    {
      applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
      status: { type: String, default: "Pending" },
      mode: { type: String },
      installment: { type: String, default: "No Installment" },
      firstInstallment: { type: Number, default: 0 },
      secondInstallment: { type: Number, default: 0 },
      fee: { type: Number, default: 0 },
    },
  ],
  refundAdmission: [
    {
      refund_status: { type: String, default: "No Refund" },
      refund_reason: { type: String },
      refund_amount: { type: Number, default: 0 },
      refund_on: { type: Date, default: Date.now },
      refund_from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
    },
  ],
  remainingFeeList: [
    {
      remainAmount: { type: String },
      appId: { type: String },
      status: { type: String, default: "Not Paid" },
      instituteId: { type: String },
    },
  ],
  certificateBonaFideCopy: {
    trueCopy: { type: Boolean, default: false },
    secondCopy: { type: Boolean, default: false },
    thirdCopy: { type: Boolean, default: false },
  },
  certificateLeavingCopy: {
    trueCopy: { type: Boolean, default: false },
    secondCopy: { type: Boolean, default: false },
    thirdCopy: { type: Boolean, default: false },
  },

  dailyUpdate: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectUpdate",
    },
  ],
  student_biometric_id: { type: String },
  election_candidate: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
    },
  ],
  participate_event: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participate",
    },
  ],
});

module.exports = mongoose.model("StudentPreviousData", previousSchema);
