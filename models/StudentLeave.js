const mongoose = require("mongoose");

const studentLeaveSchema = new mongoose.Schema({
  reason: {
    type: String,
    required: true,
  },
  date: [{ type: String }],

  classes: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  status: {
    type: String,
    default: "Request",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StudentLeave = mongoose.model("StudentLeave", studentLeaveSchema);

module.exports = StudentLeave;
