const mongoose = require("mongoose");

const newApplicationSchema = new mongoose.Schema({
  applicationName: { type: String, required: true },
  applicationDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  applicationBatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  applicationMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClassMaster",
  },
  applicationParentType: { type: String },
  applicationChildType: [],
  applicationSeats: { type: Number, default: 0 },
  applicationType: { type: String, default: "Plain Application" },
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
});

module.exports = mongoose.model("NewApplication", newApplicationSchema);
