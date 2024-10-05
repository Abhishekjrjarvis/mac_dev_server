const mongoose = require("mongoose");
const subjectContinuousEvaluationExperimentSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  experiment_type: String,
  date: {
    type: Date,
  },
  continuous_evaluation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectContinuousEvaluation",
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  student_list: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      attendance_marks: {
        type: Number,
        default: 0,
      },
      // perfomance marks
      practical_marks: {
        type: Number,
        default: 0,
      },
      journal_marks: {
        type: Number,
        default: 0,
      },
      total_marks: {
        type: Number,
        default: 0,
      },
    },
  ],

  outof: {
    type: Number,
    default: 10,
  },
  export_collection: [
    {
      excel_type: {
        type: String,
      },
      excel_file: { type: String },
      excel_file_name: { type: String },
      created_at: { type: Date, default: Date.now },
    },
  ],
  export_collection_count: {
    type: Number,
    default: 0,
  },
  import_collection: [
    {
      excel_type: {
        type: String,
      },
      excel_file: { type: String },
      created_at: { type: Date, default: Date.now },
      status: {
        type: String,
      },
    },
  ],
  import_collection_count: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model(
  "SubjectContinuousEvaluationExperiment",
  subjectContinuousEvaluationExperimentSchema
);
