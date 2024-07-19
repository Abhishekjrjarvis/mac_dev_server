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
      nested_card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NestedCard"
      },
      nest_remain: {
        type: String
      }
    },
  ],
  fee_receipt_request_count: {
    type: Number,
    default: 0
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
    default: 0
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
    default: 0
  },
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "RequiredDocument"
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
  online_amount_edit_access: {
    type: String,
    default: "Not Granted",
  },
  student: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student"
    }
  ],
  admission_stats: {
    
  },
  cancel_admission: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      cancel_on: { type: Date, default: Date.now },
      payment_status: { type: String, default: "Pending" },
      refund_amount: { type: Number, default: 0 },
      from: {
        type: String
      },
      staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
      }
    },
  ],
  cancel_admission_count: {
    type: Number,
    default: 0
  },
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
        ref: "FeeStructure"
      },
      appId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication"
      },
      app_card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NestedCard"
      },
      gov_card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NestedCard"
      }
    }
  ],
  re_admission_list_count: {
    type: Number,
    default: 0
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
        ref: "NewApplication"
      },
      structure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeStructure"
      },
      class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class"
      }
    },
  ],
  subject_groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectGroup"
    }
  ],
  subject_selected_group: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectGroup"
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
      ref: "NewApplication"
    }
  ],
  dependent_pinned_application: [
    {
      section_type: { type: String },
      application: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "NewApplication"
        }
      ]
    }
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
        ref: "Staff"
      }
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
        ref: "Staff"
      }
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
        ref: "RemainingList"
      },
      app_card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NestedCard"
      },
      gov_card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NestedCard"
      },
      revert_request_status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Status",
      },
      fee_struct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeStructure"
      },
      application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
      staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
      }
    },
  ],
});

module.exports = mongoose.model("Admission", admissionAdminSchema);
