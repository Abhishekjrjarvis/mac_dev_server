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
        ref: "FeesStructure"
      }
    },
  ],
  reviewApplication: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      review_on: { type: Date, default: Date.now },
      review_status: { type: String, default: "Pending" },
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
  allot_array: [],
  confirm_array: [],
  select_array: [],
  request_array: [],
  cancel_array: [],
  confirm_fee_array: [],
  review_array: []
});

module.exports = mongoose.model("NewApplication", newApplicationSchema);
