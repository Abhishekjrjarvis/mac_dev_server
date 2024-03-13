const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  classCode: { type: String, required: true, unique: true },
  className: { type: String, required: true },
  classTitle: { type: String, required: true },
  classAbout: { type: String },
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
  UnApproveStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  promoteStudent: [
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
    finalReport: { type: Boolean, default: true },
    attendance: { type: Boolean, default: true },
    behaviour: { type: Boolean, default: true },
    gradeMarks: { type: Boolean, default: false },
    aggregatePassingPercentage: { type: Number, default: 0 },
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  boyCount: {
    type: Number,
    default: 0,
  },
  girlCount: {
    type: Number,
    default: 0,
  },
  otherCount: {
    type: Number,
    default: 0,
  },
  strength: {
    type: Number,
    default: 0,
  },
  classStatus: {
    type: String,
    default: "UnCompleted",
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
  offlineFeeCollection: [
    {
      fee: { type: Number, default: 0 },
      feeId: { type: String },
    },
  ],
  requestFeeStatus: {
    feeId: { type: String },
    status: { type: String, default: "Pending" },
  },
  exemptFeeCollection: [
    {
      fee: { type: Number, default: 0 },
      feeId: { type: String },
    },
  ],
  onlineFeeCollection: [
    {
      fee: { type: Number, default: 0 },
      feeId: { type: String },
    },
  ],

  activeTimeDayWise: [
    {
      day: String,
      from: String,
      to: String,
      half: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  activeTimeDateWise: [
    {
      day: String,
      date: {
        type: Date,
      },
      from: String,
      to: String,
      half: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  timetableDayWise: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassTimetable",
    },
  ],
  timetableDateWise: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassTimetable",
    },
  ],
  fail: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  pass: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  optionalSubjectCount: {
    type: Number,
    default: 0,
  },
  exam_start: { type: Boolean, default: false },
  lastupto: { type: Number, default: 0 },
  exam_seating: [
    {
      subject_id: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
      seating_id: { type: mongoose.Schema.Types.ObjectId, ref: "Seating" },
      from: { type: Number, default: 0 },
      to: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      created_at: { type: Date, default: Date.now },
    },
  ],
  multiple_batches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
  ],
  multiple_batches_count: {
    type: Number,
    default: 0,
  },
  shuffle_on: {
    type: Boolean,
    default: false
  },
  member_module_unique: {
    type: String,
    unique: true
  },
  attendance_time_slot: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassAttendanceTimeSlot",
    },
  ],
  updated_timetable_count: {
    type: Number,
    default: 0,
  },
  not_updated_timetable_count: {
    type: Number,
    default: 0,
  },
});

const Class = mongoose.model("Class", classSchema);

module.exports = Class;
