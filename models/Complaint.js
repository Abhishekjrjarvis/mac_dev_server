const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  complaintType: {
    type: String,
    required: true,
  },
  complaintTo: {
    type: String,
    required: true,
  },
  complaintContent: {
    type: String,
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  classes: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  complaintStatus: {
    type: String,
    default: "Unsolved",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  complaintInsStatus: {
    type: String,
    default: "Unsolved",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
});

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
