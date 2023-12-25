const mongoose = require("mongoose");

const subjectAttainmentSchema = new mongoose.Schema({
  attainment_name: {
    type: String,
  },
  attainment_type: {
    type: String,
  },
  attainment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attainment",
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  // attainment_target: {
  //   type: Number,
  // },
  attainment_assign: [
    {
      attainment_name: {
        type: String,
      },
      attainment_mark: {
        type: Number,
      },
      attainment_mark_weight: {
        type: Number,
      },
      // "EXAM" ,  "ASSIGNMENT"
      attainment_assign_type: {
        type: String,
      },
      copo_attainment_type: { type: String },
      examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
      },
      assignmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assingment",
      },
      subject_student: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
      ],
      student_count: {
        type: Number,
        default: 0,
      },
      present_student_count: {
        type: Number,
        default: 0,
      },
      absent_student_count: {
        type: Number,
        default: 0,
      },
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

  created_at: {
    type: Date,
    default: Date.now,
  },
  //   exam: [
  //     {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "Exam",
  //     },
  //   ],
  //   assignment: [
  //     {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "Assignment",
  //     },
  //   ],
});

module.exports = mongoose.model("SubjectAttainment", subjectAttainmentSchema);
