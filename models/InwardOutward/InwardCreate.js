const mongoose = require("mongoose");

const inwardCreateSchema = new mongoose.Schema({
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  // student , parents, other
  inward_type: String,
  name: String,
  number: String,
  attachment: [],
  generated_report: String,
  date: Date,
  approvals_for: [
    {
      staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
      designation: String,
    },
  ],
  is_prepare_by: {
    type: String,
    default: "SATFF",
  },
  prepare_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  inward_status: {
    type: String,
    default: "Pending",
  },

  // by student side
  prepare_by_student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  subject: String,
  body: String,
  image: [],
  inward_outward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InwardOutward",
  },
});

module.exports = mongoose.model("InwardCreate", inwardCreateSchema);
