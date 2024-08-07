const mongoose = require("mongoose");

const newApplicationSchema = new mongoose.Schema({
  applicationName: { type: String, required: true },
  applicationDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    // required: true,
  },
  applicationBatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    // required: true,
  },
  applicationMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClassMaster",
  },
  applicationHostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
  },
  applicationUnit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HostelUnit",
  },
  applicationParentType: { type: String },
  applicationChildType: [],
  applicationSeats: { type: Number, default: 0 },
  applicationType: { type: String, default: "Plain Application" },
  application_flow: { type: String, default: "Admission Application" },
  applicationStartDate: { type: String },
  applicationEndDate: { type: String },
  admissionFee: { type: Number, default: 0 },
  admissionDueDate: { type: String },
  // applicationFee: { type: Number, required: true },
  remainingFee: { type: Number, default: 0 },
  applicationAbout: { type: String },
  admissionProcess: { type: String },
  applicationStatus: { type: String, default: "Ongoing" },
  receievedCount: { type: Number, default: 0 },
  selectCount: { type: Number, default: 0 },
  confirmCount: { type: Number, default: 0 },
  review_count: { type: Number, default: 0},
  fee_collect_count: { type: Number, default: 0},
  cancelCount: { type: Number, default: 0 },
  allotCount: { type: Number, default: 0 },
  collectedFeeCount: { type: Number, default: 0 },
  applicationPhoto: { type: String },
  photoId: { type: String, default: "0" },
  exemptAmount: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  admissionAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admission",
  },
  offlineFee: { type: Number, default: 0 },
  onlineFee: { type: Number, default: 0 },
  receievedApplication: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      apply_on: { type: Date, default: Date.now },
      fee_remain: { type: Number, default: 0 },
      reject_status: { type: String },
      staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
      }
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
      staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
      }
    },
  ],
  confirmedApplication: [
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
      staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
      }
    },
  ],
  reviewApplication: [
    {
      type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
    },
  ],
  allottedApplication: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      allot_on: { type: Date, default: Date.now },
      payment_status: { type: String, default: "Pending" },
      alloted_class: { type: String, default: "Pending" },
      alloted_status: { type: String, default: "Not Alloted" },
      fee_remain: { type: Number, default: 0 },
      paid_status: { type: "String" },
      install_type: { type: String },
      second_pay_mode: { type: "String" },
      staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
      }
    },
  ],
  cancelApplication: [
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
  gstSlab: { type: Number, default: 0 },
  gst_number: { type: String },
  business_name: { type: String },
  business_address: { type: String },
  hostelAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
  },
  applicationTypeStatus: {
    type: String,
    default: "Promote Application",
  },
  direct_linked_structure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeStructure",
  },
  direct_attach_class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  application_type: {
    type: String,
    default: "Step Wise Admission",
  },
  deleted_student_fee: {
    type: Number,
    default: 0,
  },
  gr_initials: {
    type: String,
  },
  app_qr_code: {
    type: String,
  },
  transferCount: {
    type: Number,
    default: 0,
  },
  transferApplication: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      transfer_on: { type: Date, default: Date.now },
      status: { type: String, default: "Transferred" },
    },
  ],
  receieved_array: [],
  allot_array: [],
  confirm_array: [],
  select_array: [],
  request_array: [],
  cancel_array: [],
  confirm_fee_array: [],
  review_array: [],
  student_form_setting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteApplicationForm"
  },
  subject_selected_group: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectGroup"
    }
  ],
  code_url: {
    type: String
  },
  app_hindi_qr_code: {
    type: String
  },
  app_marathi_qr_code: {
    type: String
  },
  pin: {
    status: { type: String },
    flow: { type: String },
    flow_id: { type: String }
  },
  reject_student: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
      },
      reason: { type: String },
      staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
      }
    }
  ],
  undo_student: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student"
    }
  ],
  admission_intake: {
    intake_visibility: {
      type: Boolean,
      default: false
    },
    total_intake: {
      type: Number,
      default: 0
    },
    cap_intake: {
      type: Number,
      default: 0
    },
    il_intake: {
      type: Number,
      default: 0
    }
  },
  admission_intake_data_set: {
    total_intake: { type: Number, default: 0 },
    cap_intake: { type: Number, default: 0 },
    il_intake: { type: Number, default: 0 },
    ad_th_cap: { type: Number, default: 0 },
    ad_th_ag_cap: { type: Number, default: 0 },
    ad_th_il: { type: Number, default: 0 },
    ad_th_ews: { type: Number, default: 0 },
    ad_th_tfws: { type: Number, default: 0 },
    grand_total: { type: Number, default: 0 }
  },
  collect_docs: {
      type: Boolean,
      default: false
  },
});

module.exports = mongoose.model("NewApplication", newApplicationSchema);
