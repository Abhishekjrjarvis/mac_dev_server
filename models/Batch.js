const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema({
  batchName: {
    type: String,
    required: true,
  },
  batchStatus: {
    type: String,
    default: "UnLocked",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
  },
  transport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transport",
  },
  classroom: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
  activeBatch: {
    type: String,
    default: "Not Active",
  },
  exams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
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
      ref: "Student",
    },
  ],
  UnApproveStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  idCardStatus: {
    type: String,
  },
  batchPaymentStatus: {
    type: String,
  },
  classCount: {
    type: Number,
    default: 0,
  },
  student_category: {
    boyCount: { type: Number, default: 0 },
    girlCount: { type: Number, default: 0 },
    otherCount: { type: Number, default: 0 },
    generalCount: { type: Number, default: 0 },
    obcCount: { type: Number, default: 0 },
    scCount: { type: Number, default: 0 },
    stCount: { type: Number, default: 0 },
    ntaCount: { type: Number, default: 0 },
    ntbCount: { type: Number, default: 0 },
    ntcCount: { type: Number, default: 0 },
    ntdCount: { type: Number, default: 0 },
    vjCount: { type: Number, default: 0 },
  },
  batch_type: {
    type: String,
    default: "Not Identical",
  },
  designation_send: {
    type: String,
    default: "Yes",
  },
  identical_batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  class_student_query: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  class_student_query_count: {
    type: Number,
    default: 0,
  },
  class_batch_select: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  collect_by_government: {
    type: Number,
    default: 0
  },
  pending_from_government: {
    type: Number,
    default: 0
  },
  merged_batches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch"
    }
  ],
  merged_batch: {
    type: String,
    default: "Not Merged"
  },
  u_batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch"
  }
});

const Batch = mongoose.model("Batch", batchSchema);

module.exports = Batch;
