const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema({
  hostel_manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  moderator_role: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionModerator",
    },
  ],
  moderator_role_count: {
    type: Number,
    default: 0,
  },
  fees_structures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStructure",
    },
  ],
  fees_structures_count: {
    type: Number,
    default: 0,
  },
  modify_fees_structures_count: {
    type: Number,
    default: 0,
  },
  onlineFee: {
    type: Number,
    default: 0,
  },
  offlineFee: {
    type: Number,
    default: 0,
  },
  exemptAmount: {
    type: Number,
    default: 0,
  },
  remainingFeeCount: {
    type: Number,
    default: 0,
  },
  requested_status: {
    type: String,
    default: "Pending",
  },
  collected_fee: {
    type: Number,
    default: 0,
  },
  hostel_unit_count: {
    type: Number,
    default: 0,
  },
  photoId: {
    type: String,
  },
  hostel_photo: {
    type: String,
  },
  units: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HostelUnit",
    },
  ],
  rules: [
    {
      regulation_headline: { type: String },
      regulation_description: { type: String },
      regulation_attachment: { type: String },
    },
  ],
  rules_count: {
    type: Number,
    default: 0,
  },
  remainingFee: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  hostel_wardens: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  hostel_wardens_count: {
    type: Number,
    default: 0,
  },
  newApplication: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewApplication",
    },
  ],
  newAppCount: {
    type: Number,
    default: 0,
  },
  hostelities_count: {
    type: Number,
    default: 0,
  },
  completedCount: {
    type: Number,
    default: 0,
  },
  bank_account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankAccount",
  },
  boy_count: {
    type: Number,
    default: 0,
  },
  girl_count: {
    type: Number,
    default: 0,
  },
  other_count: {
    type: Number,
    default: 0,
  },
  request_array: [],
  fee_receipt_request: [
    {
      receipt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt",
      },
      status: { type: String, default: "Pending" },
      created_at: { type: Date, default: Date.now },
      demand_cheque_status: { type: String, default: "Pending" },
    },
  ],
  fee_receipt_approve: [
    {
      receipt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt",
      },
      status: { type: String, default: "Pending" },
      created_at: { type: Date, default: Date.now },
      over_status: { type: String },
      demand_cheque_status: { type: String, default: "Pending" },
    },
  ],
  fee_receipt_reject: [
    {
      receipt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt",
      },
      status: { type: String, default: "Pending" },
      created_at: { type: Date, default: Date.now },
      reason: { type: String },
      demand_cheque_status: { type: String, default: "Pending" },
    },
  ],
  student_form_query: {
    personalInfo: { type: Boolean, default: true },
    otherPersonalInfo: { type: Boolean, default: false },
    identityDetails: { type: Boolean, default: false },
    addressInfo: { type: Boolean, default: false },
    parentsInfo: { type: Boolean, default: false },
    enrollmentPrn: { type: Boolean, default: false },
    previousSchoolAndDocument: {
      previousSchoolDocument: { type: Boolean, default: false },
      aadharCard: { type: Boolean, default: false },
      identityDocument: { type: Boolean, default: false },
      casteCertificate: { type: Boolean, default: false },
      joiningTransferLetter: { type: Boolean, default: false },
      leavingTransferCertificate: { type: Boolean, default: false },
      incomeCertificate: { type: Boolean, default: false },
      lastYearMarksheet: { type: Boolean, default: false },
      nationalityCertificate: { type: Boolean, default: false },
      domicileCertificate: { type: Boolean, default: false },
      nonCreamyLayerCertificate: { type: Boolean, default: false },
    },
    bankDetails: { type: Boolean, default: false },
    cpi: { type: Boolean, default: false },
  },
  bed_count: {
    type: Number,
    default: 0,
  },
  room_count: {
    type: Number,
    default: 0,
  },
  announcement: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InsAnnouncement",
    },
  ],
  announcementCount: {
    type: Number,
    default: 0,
  },
  site_info: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HostelSite",
    },
  ],
  refund_deposit: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeReceipt",
    },
  ],
  export_collection: [
    {
      excel_file: { type: String },
      excel_file_name: { type: String },
      created_at: { type: Date, default: Date.now },
    },
  ],
  export_collection_count: {
    type: Number,
    default: 0,
  },
  batches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
  ],
  departmentSelectBatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  batchCount: {
    type: Number,
    default: 0,
  },
  ug_undertakings_hostel_admission: {
    type: Boolean,
    default: false,
  },
  pg_undertakings_hostel_admission: {
    type: Boolean,
    default: false,
  },
  masters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
  ],
  masterCount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Hostel", hostelSchema);
