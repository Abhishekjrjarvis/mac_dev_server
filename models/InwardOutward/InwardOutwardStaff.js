const mongoose = require("mongoose");

const inwardOutwardStaffSchema = new mongoose.Schema({
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  sent_outward_pending: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OutwardCreate",
    },
  ],
  sent_outward_approved: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OutwardCreate",
    },
  ],
  recieve_outward_pending: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OutwardCreate",
    },
  ],
  recieve_outward_approved: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OutwardCreate",
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("InwardOutwardStaff", inwardOutwardStaffSchema);
