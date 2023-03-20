const mongoose = require("mongoose");

const previousSchema = new mongoose.Schema({
  studentCode: { type: String },
  studentClass: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  batches: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  studentROLLNO: { type: String },
  studentBehaviour: { type: mongoose.Schema.Types.ObjectId, ref: "Behaviour" },
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
  allottedChecklist: [
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

  leave: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentLeave",
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
      refund_from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
    },
  ],
  remainingFeeList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RemainingList",
    },
  ],
  remainingFeeList_count: {
    type: Number,
    default: 0,
  },
  fee_structure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeStructure",
  },
  active_fee_heads: [
    {
      appId: { type: mongoose.Schema.Types.ObjectId, ref: "NewApplication" },
      head_name: { type: String },
      created_at: { type: Date, default: Date.now },
      applicable_fee: { type: Number, default: 0 },
      remain_fee: { type: Number, default: 0 },
      paid_fee: { type: Number, default: 0 },
      fee_structure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeStructure",
      },
      master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      original_paid: { type: Number, default: 0 },
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
  participate_result: [
    {
      event: { type: mongoose.Schema.Types.ObjectId, ref: "Participate" },
      rank: { type: String },
      created_at: { type: Date, default: Date.now },
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
  vehicle_payment_status: [
    {
      vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
      status: { type: String, default: "Not Paid" },
      created_at: { type: Date, default: Date.now },
      amount: { type: Number, default: 0 },
    },
  ],
  routes: [
    {
      routeId: { type: String },
      routePath: { type: String },
    },
  ],
  active_routes: {
    type: String,
  },
  active_status: [],
  query_count: {
    type: Number,
    default: 0,
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor",
  },
  queries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queries",
    },
  ],
  total_query: {
    type: Number,
    default: 0,
  },
  feed_back_count: {
    type: Number,
    default: 0,
  },
  deposit_pending_amount: {
    type: Number,
    default: 0,
  },
  deposit_refund_amount: {
    type: Number,
    default: 0,
  },
  refund_deposit: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeReceipt",
    },
  ],
  form_status: {
    type: String,
    default: "Not Filled",
  },
  fee_receipt: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeReceipt",
    },
  ],
});

module.exports = mongoose.model("StudentPreviousData", previousSchema);
