const mongoose = require("mongoose");

const studentGiveFeedbackSchema = new mongoose.Schema({
  feedback_name: {
    type: String,
  },
  // Range or Other
  feedback_type: {
    type: String,
    default: "Other",
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
});

module.exports = mongoose.model(
  "StudentGiveFeedback",
  studentGiveFeedbackSchema
);