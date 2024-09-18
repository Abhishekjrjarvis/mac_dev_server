const mongoose = require("mongoose");
const subjectContinuousEvaluationSchema = new mongoose.Schema({
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
  evaluation_experiment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectContinuousEvaluationExperiment",
    },
  ],
  experiment_outof: {
    type: Number,
    default: 100,
  },
  attendance_outof: {
    type: Number,
    default: 50,
  },
  cls_test_outof: {
    type: Number,
    default: 30,
  },
  assignment_outof: {
    type: Number,
    default: 20,
  },
  total_outof: {
    type: Number,
    default: 200,
  },
  final_outof: {
    type: Number,
    default: 200,
  },
  university_outof: {
    type: Number,
    default: 0,
  },
  student_list: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  experiment_toggle: {
    type: Boolean,
    default: true,
  },
  attendance_toggle: {
    type: Boolean,
    default: true,
  },
  cls_test_toggle: {
    type: Boolean,
    default: true,
  },
  assignment_toggle: {
    type: Boolean,
    default: true,
  },
  attendance_subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  cls_test_subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  assignment_subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  cls_test_exam: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
  ],

  student_data: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      all_exp: {
        type: Number,
        default: 0,
      },
      attendance: {
        type: Number,
        default: 0,
      },
      cls_test: {
        type: Number,
        default: 0,
      },
      assingment: {
        type: Number,
        default: 0,
      },
      // total: {
      //   type: Number,
      //   default: 0,
      // },
    },
  ],

  student_overall_data: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      all_exp: {
        type: Number,
        default: 0,
      },
      attendance: {
        type: Number,
        default: 0,
      },
      cls_test: {
        type: Number,
        default: 0,
      },
      assingment: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        default: 0,
      },
      by_university: {
        type: Number,
        default: 0,
      },
      // final: {
      //   type: Number,
      //   default: 0,
      // },
    },
  ],
  student_marks_university: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      marks: {
        type: Number,
        default: 0,
      },
    },
  ],
  student_university_seat: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      seat_no: {
        type: String,
      },
    },
  ],
  attendance_grade_count: {
    type: Number,
    default: 0,
  },
  attendance_grade_marks: [
    {
      start_range: {
        type: Number,
        default: 0,
      },
      end_range: {
        type: Number,
        default: 0,
      },
      grade_marks: {
        type: Number,
        default: 0,
      },
    },
  ],
});

module.exports = mongoose.model(
  "SubjectContinuousEvaluation",
  subjectContinuousEvaluationSchema
);
