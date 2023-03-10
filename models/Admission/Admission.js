const mongoose = require("mongoose");

const admissionAdminSchema = new mongoose.Schema({
  admissionAdminName: { type: String },
  admissionAdminEmail: { type: String },
  admissionAdminPhoneNumber: { type: String },
  admissionAdminAbout: { type: String },
  admissionAdminHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  photoId: { type: String, default: "1" },
  coverId: { type: String, default: "2" },
  photo: { type: String },
  cover: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
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
  completedCount: {
    type: Number,
    default: 0,
  },
  offlineFee: {
    type: Number,
    default: 0,
  },
  onlineFee: {
    type: Number,
    default: 0,
  },
  queryCount: {
    type: Number,
    default: 0,
  },
  exemptAmount: { type: Number, default: 0 },
  remainingFee: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  refundFeeList: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      refund: { type: Number, default: 0 },
    },
  ],
  refundCount: {
    type: Number,
    default: 0,
  },
  remainingFeeCount: {
    type: Number,
    default: 0,
  },
  inquiryList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inquiry",
    },
  ],
  requested_status: {
    type: String,
    default: "Pending",
  },
  collected_fee: {
    type: Number,
    default: 0,
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
  request_array: [],
  fee_receipt_request: [
    {
      receipt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt",
      },
      status: { type: String, default: "Pending" },
      created_at: { type: Date, default: Date.now },
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
    },
  ],
  alarm_count: {
    type: Number,
    default: 0,
  },
  required_document: [
    {
      document_name: { type: String },
      document_key: { type: String },
      applicable_to: { type: String },
      created_at: { type: Date, default: Date.now },
    },
  ],
  required_document_count: {
    type: Number,
    default: 0,
  },
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
  designation_password: {
    type: String,
  },
  enable_protection: { type: Boolean, default: true },
  designation_status: {
    type: String,
    default: "Locked",
  },
});

module.exports = mongoose.model("Admission", admissionAdminSchema);
