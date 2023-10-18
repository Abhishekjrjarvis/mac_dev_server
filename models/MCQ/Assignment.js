const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  assignmentName: {
    type: String,
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  dueDate: {
    type: String,
  },
  descritpion: {
    type: String,
  },
  testSet: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMasterTestSet",
    },
  ],
  files: [
    {
      documentType: {
        type: String,
      },
      documentName: {
        type: String,
      },
      documentSize: {
        type: String,
      },
      documentKey: {
        type: String,
      },
      documentEncoding: {
        type: String,
      },
    },
  ],
  student: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],

  submittedStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],

  totalCount: {
    type: Number,
    default: 0,
  },
  submittedCount: {
    type: Number,
    default: 0,
  },
  checkedCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  copo_attainment: { type: String },
  copo_attainment_type: { type: String },
  assignment_total_mark: { type: Number },
  inCompleteStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  subject_copo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectAttainment",
    },
  ],
  student_assignment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentAssignment",
    },
  ],
});

module.exports = mongoose.model("Assignment", assignmentSchema);
