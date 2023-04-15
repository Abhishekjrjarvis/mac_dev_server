const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  examName: { type: String, required: true },
  examType: { type: String, required: true },
  examMode: { type: String, required: true },
  examWeight: { type: Number },
  createdAt: { type: Date, default: Date.now },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },

  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },

  class: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
  ],
  subjects: [
    {
      subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
      },
      subjectName: { type: String, required: true },
      totalMarks: { type: Number, required: true },
      date: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      duration: { type: String, default: 0 },
      subjectMasterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubjectMaster",
        required: true,
      },
      testSetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubjectMasterTestSet",
      },
      seating_sequence: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Seating",
        },
      ],
    },
  ],
  seating_sequence: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seating",
    },
  ],
  seating_sequence_count: {
    type: Number,
    default: 0,
  },
});

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;
