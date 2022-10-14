const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentCode: { type: String },
  studentProfilePhoto: { type: String },
  photoId: { type: String },
  studentFirstName: { type: String },
  studentMiddleName: { type: String },
  studentLastName: { type: String },
  studentDOB: { type: String },
  studentGender: { type: String },
  studentNationality: { type: String },
  studentMTongue: { type: String },
  studentMotherName: { type: String },
  studentCast: { type: String },
  studentCastCategory: { type: String },
  studentReligion: { type: String },
  studentBirthPlace: { type: String },
  studentBookNo: { type: String },
  studentDistrict: { type: String },
  studentState: { type: String },
  studentAddress: { type: String },
  studentPhoneNumber: { type: Number, maxlength: 10, minlength: 10 },
  studentAadharNumber: { type: String, maxlength: 12, minlength: 12 },
  studentParentsName: { type: String },
  studentParentsPhoneNumber: { type: Number, maxlength: 10, minlength: 10 },
  studentDocuments: { type: String },
  studentAadharFrontCard: { type: String },
  studentAadharBackCard: { type: String },
  studentPanNumber: { type: String },
  studentBankName: { type: String },
  studentBankAccount: { type: String },
  studentBankAccountHolderName: { type: String },
  studentBankIfsc: { type: String },
  studentBankAccountType: { type: String },
  studentCasteCertificate: [],
  studentHeight: { type: String },
  studentWeight: { type: String },
  studentBMI: { type: String },
  studentCertificateNo: { type: String },
  studentStatus: { type: String, default: "Not Approved" },
  studentPremoteStatus: { type: String, default: "Not Promoted" },
  studentReason: { type: String },
  studentCertificateDate: { type: String },
  studentLeavingInsDate: { type: String },
  studentLeavingRemark: { type: String },
  studentBookNo: { type: String },
  studentCertificateNo: { type: String },
  studentROLLNO: { type: String },
  studentMothersName: { type: String },
  studentGRNO: { type: String },
  studentLeavingBehaviour: { type: String },
  studentLeavingStudy: { type: String },
  studentLeavingReason: { type: String },
  studentLeavingPrevious: { type: String },
  studentLeavingStatus: { type: String, default: "Not Ready" },
  studentBonaStatus: { type: String, default: "Not Ready" },
  studentClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  studentBehaviour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Behaviour",
  },
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
  totalAssigment: {
    type: Number,
    default: 0,
  },
  submittedAssigment: {
    type: Number,
    default: 0,
  },

  previousYearData: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentPreviousData",
    },
  ],

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
  checklistAllottedStatus: {
    type: String,
    default: "Not Allotted",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
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
  sportEvent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportEvent",
    },
  ],
  sportClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SportClass",
  },
  sportTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SportTeam",
  },
  sportEventMatch: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportEventMatch",
    },
  ],
  rankTitle: {
    type: String,
  },
  extraPoints: {
    type: Number,
    default: 0,
  },
  complaints: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
  ],
  batches: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
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
  paymentList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  ],
  applyList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApplyPayment",
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
  // library: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Library",
  // },
  studentAdmissionDate: {
    type: String,
  },
  borrow: [{ type: mongoose.Schema.Types.ObjectId, ref: "IssueBook" }],
  deposite: [{ type: mongoose.Schema.Types.ObjectId, ref: "CollectBook" }],
  deptElections: [
    {
      electionStatus: {
        type: String,
        default: "Not Applied",
      },
      election: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Elections",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sportEventCount: {
    type: Number,
    default: 0,
  },
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
