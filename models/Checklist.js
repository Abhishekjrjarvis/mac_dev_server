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

  checklistDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  assignedStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  studentsList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  gstSlab: { type: Number, default: 0 },
  gst_number: { type: String },
  business_name: { type: String },
  business_address: { type: String },
});

const Checklist = mongoose.model("Checklist", checklistSchema);

module.exports = Checklist;
