const mongoose = require("mongoose");
const Department = require("./Department");
const Class = require("./Class");
const Staff = require("./Staff");
const SubjectMaster = require("./SubjectMaster");
const Student = require('./Student')
const Field = require('./Field')
const InstituteAdmin = require('./InstituteAdmin')

const batchSchema = new mongoose.Schema({
  batchName: {
    type: String,
    required: true,
  },
  batchStatus: {
    type: String,
    default: "UnLocked"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InstituteAdmin'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  classroom: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
  batchExam: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam"
    }
  ],
  batchStaff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  ApproveStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    }
  ],
  idCardStatus: {
    type: String
  },
  batchPaymentStatus: {
    type: String
  },
  classCount: {
    type: Number,
    default: 0
  }
});

const Batch = mongoose.model("Batch", batchSchema);

module.exports = Batch;
