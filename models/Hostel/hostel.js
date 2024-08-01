const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema({
  hostel_manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    // required: true,
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
  fee_receipt_request_count: {
    type: Number,
    default: 0,
  },
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
  fee_receipt_approve_count: {
    type: Number,
    default: 0,
  },
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
  fee_receipt_reject_count: {
    type: Number,
    default: 0,
  },
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
  linked_institute: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  linked_institute_count: {
    type: Number,
    default: 0,
  },
  member_module_unique: {
    type: String,
    unique: true
  },
  request: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RequestGoods"
    }
  ],
  issue: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IssueGoods"
    }
  ],
  return: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReturnGoods"
    }
  ],
  consume: [],
  stock_take: [],
  register: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StoreLogs"
    }
  ],
  maintanence: [],
  student: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student"
    }
  ],
  app_qr_code: {
    type: String
  },
  code_url: {
    type: String
  },
  app_hindi_qr_code: {
    type: String
  },
  app_marathi_qr_code: {
    type: String
  },
  independent_pinned_application: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewApplication",
    },
  ],
  dependent_pinned_application: [
    {
      section_type: { type: String },
      application: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "NewApplication",
        },
      ],
    },
  ],
  selectedApplication: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      select_on: { type: Date, default: Date.now },
      payment_status: { type: String, default: "Pending" },
      install_type: { type: String },
      fee_remain: { type: Number, default: 0 },
      docs_collect: { type: String, default: "Not Collected" },
      status_id: { type: mongoose.Schema.Types.ObjectId, ref: "Status" },
      edited_struct: { type: Boolean, default: true },
      revert_request_status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Status",
      },
      application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
      staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
    },
  ],
  confirmedApplication_query: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      apply_on: { type: Date, default: Date.now },
      payment_status: { type: String, default: "Pending" },
      fee_remain: { type: Number, default: 0 },
      paid_status: { type: "String" },
      install_type: { type: String },
      second_pay_mode: { type: "String" },
      status_id: { type: mongoose.Schema.Types.ObjectId, ref: "Status" },
      transfer_status: {
        type: String,
        default: "Not Transferred",
      },
      transfer_from_app: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
      revert_request_status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Status",
      },
      application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
      staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
    },
  ],
  FeeCollectionApplication: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      apply_on: { type: Date, default: Date.now },
      payment_status: { type: String, default: "Pending" },
      fee_remain: { type: Number, default: 0 },
      paid_status: { type: "String" },
      install_type: { type: String },
      second_pay_mode: { type: "String" },
      status_id: { type: mongoose.Schema.Types.ObjectId, ref: "Status" },
      transfer_status: {
        type: String,
        default: "Not Transferred",
      },
      transfer_from_app: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
      payment_flow: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RemainingList",
      },
      app_card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NestedCard",
      },
      gov_card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NestedCard",
      },
      revert_request_status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Status",
      },
      fee_struct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeStructure",
      },
      application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
      staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
    },
  ],
  re_admission_list: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      apply_on: { type: Date, default: Date.now },
      payment_status: { type: String, default: "Pending" },
      fee_struct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeStructure",
      },
      appId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
      app_card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NestedCard",
      },
      gov_card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NestedCard",
      },
    },
  ],
  re_admission_list_count: {
    type: Number,
    default: 0,
  },
  confirmedApplication: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      apply_on: { type: Date, default: Date.now },
      appId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
      structure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeStructure",
      },
      class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
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
});

module.exports = mongoose.model("Hostel", hostelSchema);
