const mongoose = require("mongoose");

const staffStudentFeedbackSchema = new mongoose.Schema({
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  feedbackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StudentFeedback",
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  subject_master: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMaster",
    },
  ],
  classes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
  student_give_feedback: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentGiveFeedback",
    },
  ],

  student_give_feedback_count: {
    type: Number,
    default: 0,
  },
  analytic: [
    {
      subject_master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubjectMaster",
      },
      feedback_analytic: [],
    },
  ],
  subject_analytic: [
    {
      subject_master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubjectMaster",
      },
      feedback_percentage: {
        type: Number,
        default: 0,
      },
    },
  ],
  analytic_evaluation: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model(
  "StaffStudentFeedback",
  staffStudentFeedbackSchema
);
