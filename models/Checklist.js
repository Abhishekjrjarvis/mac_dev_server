const mongoose = require("mongoose");

const checklistSchema = new mongoose.Schema({
  checklistName: {
    type: String,
    required: true,
  },
  checklistFees: {
    type: String,
    default: "No",
  },
  checklistAmount: {
    type: Number,
    default: 0,
  },
  checklistClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  checklistDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  student: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  studentAssignedStatus: {
    type: String,
    default: "Not Assigned",
  },
  studentsList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  checklistFeeStatus: {
    type: String,
    default: "Not Paid",
  },
  checklistStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
});

const Checklist = mongoose.model("Checklist", checklistSchema);

module.exports = Checklist;
