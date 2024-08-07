const mongoose = require("mongoose");
const subjectInternalEvaluationSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  out_of: Number,
  internal_evaluation_test: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectInternalEvaluationTest",
    },
  ],
  student_list: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      obtain_marks: {
        type: Number,
        default: 0,
      },
    },
  ],
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  createdAt: {
    type: Date,
    default: Date.now,
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
});

module.exports = mongoose.model(
  "SubjectInternalEvaluation",
  subjectInternalEvaluationSchema
);