const mongoose = require("mongoose");

const studentGiveFeedbackSchema = new mongoose.Schema({
  feedback_name: {
    type: String,
  },
  // Range or Other or Normal
  feedback_type: {
    type: String,
    default: "Range",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  subject_teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  subject_master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectMaster",
  },
  student_class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  institute_feedback: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentFeedback",
  },
  questions: [
    {
      question_sno: {
        type: String,
      },
      question_title: {
        type: String,
      },
      options: [
        {
          option_sno: {
            type: String,
          },
          option: { type: String },
          selected: {
            type: Boolean,
            default: false,
          },
        },
      ],
      point: {
        type: String,
      },
    },
  ],

  created_at: {
    type: Date,
    default: Date.now,
  },
  avg_point: {
    type: String,
  },
  feedback_rating: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model(
  "StudentGiveFeedback",
  studentGiveFeedbackSchema
);
