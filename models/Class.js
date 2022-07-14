const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  classCode: { type: String, required: true, unique: true },
  className: { type: String, required: true },
  classTitle: { type: String, required: true },
  classAbout: { type: String },
  classStudentTotal: { type: String },
  classSubjectTotal: { type: String },
  classDisplayPerson: { type: String },
  photoId: { type: String, default: "1" },
  photo: { type: String },
  coverId: { type: String, default: "2" },
  cover: { type: String },
  masterClassName: { type: mongoose.Schema.Types.ObjectId, ref: "ClassMaster" },
  classHeadTitle: { type: String, required: true },
  subject: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  student: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  ApproveStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  checklist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checklist",
    },
  ],
  fee: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  studentBehaviour: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Behaviour",
    },
  ],
  exams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
  ],

  attendenceDate: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendenceDate",
    },
  ],
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  offlineTotalFee: {
    type: Number,
    default: 0,
  },
  onlineTotalFee: {
    type: Number,
  },
  classTotalCollected: {
    type: Number,
  },
  classTotalSubmitted: {
    type: Number,
  },
  receieveFee: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  submitFee: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  exemptFee: {
    type: Number,
    default: 0,
  },
  finalReportsSettings: {
    finalReport: { type: Boolean, default: false },
    attendance: { type: Boolean, default: false },
    behaviour: { type: Boolean, default: false },
    graceMarks: { type: Boolean, default: false },
    gradeMarks: { type: Boolean, default: false },
    subjectPassingMarks: { type: Number, default: 0 },
    aggregatePassingPercentage: { type: Number, default: 0 },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },

  classStatus: {
    type: String,
    default: "UnLocked",
  },
  studentComplaint: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
  ],
  studentLeave: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentLeave",
    },
  ],
  studentTransfer: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentTransfer",
    },
  ],
  playlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
    },
  ],

  classStartDate: {
    type: String,
  },

  //depriciated
  studentRepresentative: {
    type: String,
  },

  subjectCount: {
    type: Number,
    default: 0,
  },
  studentCount: {
    type: Number,
    default: 0,
  },
  displayPersonList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DisplayPerson",
    },
  ],
});

const Class = mongoose.model("Class", classSchema);

module.exports = Class;
