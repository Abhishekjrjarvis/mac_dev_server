const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  examName: { type: String, required: true },
  examType: { type: String, default: "Not spceified" },
  examMode: { type: String, default: "Not spceified" },
  examWeight: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },

  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
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
      subject_copo: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SubjectAttainment",
        },
      ],
      subject_attachment: [
        {
          documentName: "",
          documentKey: "",
          documentType: "",
        },
      ],
      subject_student: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
      ],
      mapping_type: {
        type: String,
        // enum: ["DIRECT", "QPEVALUATE"],
      },
      question_evaluation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuestionEvaluation",
      },
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
  attednance: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendenceDate",
    },
  ],
  malicicous: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamMalicious",
    },
  ],
  exam_status: {
    type: String,
    default: "Normal Exam",
  },
  is_backlog_notify: {
    type: String,
    default: "Not Send",
  },
  copo_attainment: { type: String },
  copo_attainment_type: { type: String },

  // EXAM, SUBJECT_TEACHER  EVALUATION
  exam_created_by: { type: String, default: "EXAM" },
});

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;
