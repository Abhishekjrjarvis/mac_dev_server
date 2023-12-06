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
  refundedFeeList: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      refund: { type: Number, default: 0 },
      fee_receipt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt",
      },
    },
  ],
  refundedCount: {
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
      demand_cheque_status: { type: String, default: "Pending" },
      reason: { type: String },
    },
  ],
  alarm_count: {
    type: Number,
    default: 0,
  },
  alarm_enable: {
    type: Date,
  },
  alarm_enable_status: {
    type: String,
    default: "Enable",
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
  scholarship: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScholarShip",
    },
  ],
  scholarship_count: {
    type: Number,
    default: 0,
  },
  scholarship_completed_count: {
    type: Number,
    default: 0,
  },
  site_info: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionSite",
    },
  ],
  deleted_student_fee: {
    type: Number,
    default: 0,
  },
  structure_mismatch_amount: {
    type: Number,
    default: 0,
  },
  active_tab_index: {
    type: String,
    default: "Pending_Fees_Query",
  },
  pending_fee_custom_filter: {
    gender: {
      type: String,
    },
    cast_category: {
      type: String,
    },
    department: [],
    batch: [],
    master: [],
  },
  pending_all_student_fee_custom_filter: {
    gender: {
      type: String,
    },
    cast_category: {
      type: String,
    },
    department: [],
    batch: [],
    master: [],
  },
  tab_manage: {
    all_students: {
      type: Boolean,
      default: true
    },
    ongoing_admission: {
      type: Boolean,
      default: true
    },
    admission_enquiry: {
      type: Boolean,
      default: true
    },
    offline_payment_verification: {
      type: Boolean,
      default: true
    },
    pending_fee: {
      type: Boolean,
      default: true
    },
    scholarships_management: {
      type: Boolean,
      default: true
    },
    excess_fee: {
      type: Boolean,
      default: true
    },
    complete_admission: {
      type: Boolean,
      default: true
    },
    required_documents: {
      type: Boolean,
      default: true
    },
    data_export: {
      type: Boolean,
      default: true
    },
    admission_mods: {
      type: Boolean,
      default: true
    },
  },
  member_module_unique: {
    type: String,
    unique: true
  },
  admission_stats: {
    
  }
});

module.exports = mongoose.model("Admission", admissionAdminSchema);
