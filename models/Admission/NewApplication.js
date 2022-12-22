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
  applicationSeats: { type: Number, default: 0 },
  applicationType: { type: String, default: "Plain Application" },
  applicationStartDate: { type: String },
  applicationEndDate: { type: String },
  admissionFee: { type: Number, required: true },
  admissionDueDate: { type: String },
  // applicationFee: { type: Number, required: true },
  remainingFee: { type: Number, default: 0 },
  applicationAbout: { type: String, required: true },
  admissionProcess: { type: String },
  applicationStatus: { type: String, default: "Ongoing" },
  receievedCount: { type: Number, default: 0 },
  selectCount: { type: Number, default: 0 },
  confirmCount: { type: Number, default: 0 },
  cancelCount: { type: Number, default: 0 },
  allotCount: { type: Number, default: 0 },
  collectedFeeCount: { type: Number, default: 0 },
  applicationPhoto: { type: String },
  photoId: { type: String, default: "1" },
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
  one_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  two_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  three_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  four_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  five_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  six_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  seven_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  eight_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  nine_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  ten_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  eleven_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  tweleve_installments: {
    fees: { type: Number, default: 0 },
    dueDate: { type: String },
  },
  total_installments: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("NewApplication", newApplicationSchema);
