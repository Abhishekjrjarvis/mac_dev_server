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
  studentBirthPlacePincode: { type: String },
  studentBirthPlaceState: { type: String },
  studentBirthPlaceDistrict: { type: String },
  studentBookNo: { type: String },
  studentDistrict: { type: String },
  studentPincode: { type: String },
  studentState: { type: String },
  studentAddress: { type: String },
  studentCurrentPincode: { type: String },
  studentCurrentDistrict: { type: String },
  studentCurrentState: { type: String },
  studentCurrentAddress: { type: String },
  studentPhoneNumber: { type: Number },
  studentAadharNumber: { type: String },
  studentParentsName: { type: String },
  studentParentsPhoneNumber: { type: Number },
  studentFatherRationCardColor: { type: String },
  studentParentsOccupation: { type: String },
  studentParentsAnnualIncom: { type: String },
  studentAadharFrontCard: { type: String },
  studentAadharBackCard: { type: String },
  studentPreviousSchool: { type: String },
  studentBankName: { type: String },
  studentBankAccount: { type: String },
  studentBankAccountHolderName: { type: String },
  studentBankIfsc: { type: String },
  studentBankPassbook: { type: String },
  studentCasteCertificatePhoto: { type: String },
  studentUidaiNumber: { type: String },
  studentDocuments: [
    {
      documentName: {
        type: String,
      },
      documentKey: {
        type: String,
      },
      documentType: {
        type: String,
      },
    },
  ],
  studentOptionalSubject: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
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

  allottedChecklist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checklist",
    },
  ],
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
  sportClass: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportClass",
    },
  ],
  sportTeam: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportTeam",
    },
  ],
  extraPoints: {
    type: Number,
    default: 0,
  },
  sportEvent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportEvent",
    },
  ],
  studentSportsEventMatch: [
    {
      eventMatch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SportEventMatch",
      },
      rankTitle: { type: String, default: "Announced to be soon" },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
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
  batchCount: {
    type: Number,
    default: 0,
  },
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
  admissionPaidFeeCount: {
    type: Number,
    default: 0,
  },
  paidFeeList: [
    {
      paidAmount: { type: Number, default: 0 },
      appId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
    },
  ],
  refundAdmission: [
    {
      refund_status: { type: String, default: "No Refund" },
      refund_reason: { type: String },
      refund_amount: { type: Number, default: 0 },
      refund_on: { type: Date, default: Date.now },
    },
  ],
  remainingFeeList: [
    {
      remainAmount: { type: Number, default: 0 },
      appId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
      status: { type: String, default: "Not Paid" },
      instituteId: { type: String },
      installmentValue: { type: String },
      isEnable: { type: Boolean, default: false },
      mode: { type: String },
      originalFee: { type: Number, default: 0 },
      dueDate: { type: String },
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
  backlog: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Backlog",
    },
  ],
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
  },
  vehicleRemainFeeCount: {
    type: Number,
    default: 0,
  },
  vehiclePaidFeeCount: {
    type: Number,
    default: 0,
  },
  routes: [],
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
