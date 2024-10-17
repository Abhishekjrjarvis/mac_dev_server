const mongoose = require("mongoose");

const outwardCreateSchema = new mongoose.Schema({
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  //notice, reminder, event &seminar
  outward_type: String,
  subject: String,
  body: String,
  image: [],
  attachment: [],
  generated_report: String,
  prepare_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  is_prepare_by: {
    type: String,
    default: "STAFF",
  },
  approvals_for: [
    {
      staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
      designation: String,
      status: {
        type: String,
        default: "Pending",
      },
    },
  ],
  outward_status: {
    type: String,
    default: "Pending",
  },
  published_status: {
    type: String,
    default: "READY_TO_PUBLISH",
  },
  other_published_status: {
    type: String,
  },
  inward_outward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InwardOutward",
  },
  outward_number: {
    type: String,
  },
  model_type: {
    type: String,
    default: "OUTWARD",
  },
  // add manual
  name: String,
  number: String,
  date: Date,
  // for add student
  prepare_by_student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  cancle_by_staff: [
    {
      staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
      reason: String,
      resent: {
        type: String,
        default: "Yes",
      },
    },
  ],
  is_resent: String,
  published_arr: [
    {
      which_type: String,
      announcement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InsAnnouncement",
      },
    },
  ],
});

module.exports = mongoose.model("OutwardCreate", outwardCreateSchema);
