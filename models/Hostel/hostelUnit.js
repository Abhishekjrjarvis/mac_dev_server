const mongoose = require("mongoose");

const hostelUnitSchema = new mongoose.Schema({
  hostel_unit_name: {
    type: String,
    required: true,
  },
  hostel_unit_head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
  },
  room_count: {
    type: Number,
    default: 0,
  },
  bed_count: {
    type: Number,
    default: 0,
  },
  photoId: {
    type: String,
  },
  hostel_unit_photo: {
    type: String,
  },
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HostelRoom",
    },
  ],
  hostelities_count: {
    type: Number,
    default: 0,
  },
  hostelities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  renewal_receieved_application: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      apply_on: { type: Date, default: Date.now },
      fee_remain: { type: Number, default: 0 },
      appId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
    },
  ],
  renewal_receieved_application_count: {
    type: Number,
    default: 0,
  },
  renewal_selected_application: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      select_on: { type: Date, default: Date.now },
      payment_status: { type: String, default: "Pending" },
      install_type: { type: String },
      fee_remain: { type: Number, default: 0 },
      appId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
    },
  ],
  renewal_selected_application_count: {
    type: Number,
    default: 0,
  },
  renewal_confirmed_application: [
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
      appId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
    },
  ],
  renewal_confirmed_application_count: {
    type: Number,
    default: 0,
  },
  renewal_allotted_application: [
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
      appId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
    },
  ],
  renewal_allotted_application_count: {
    type: Number,
    default: 0,
  },
  renewal_cancel_application: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      cancel_on: { type: Date, default: Date.now },
      payment_status: { type: String, default: "Pending" },
      refund_amount: { type: Number, default: 0 },
      appId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
    },
  ],
  renewal_cancel_application_count: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("HostelUnit", hostelUnitSchema);
