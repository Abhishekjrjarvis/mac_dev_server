const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  complaintType: {
    type: String,
    required: true,
  },
  complaintContent: {
    type: String,
    required: true,
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },

  complaintStatus: {
    type: String,
    default: "Unsolved",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
});

const Complaint = mongoose.model("StaffComplaint", complaintSchema);

module.exports = Complaint;
