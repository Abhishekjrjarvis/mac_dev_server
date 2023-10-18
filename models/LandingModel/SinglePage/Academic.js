const mongoose = require("mongoose");

const academicSchema = new mongoose.Schema({
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  academic_about: {
    type: String,
  },
  academic_head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  academic_photo: {
    type: String,
  },
  academic_rules: [],
  academic_calendar: [
    {
      calendar_name: {
        type: String,
      },
      calendar: {
        type: String,
      },
    },
  ],
  academic_mechanism: [],
  academic_student_feedback: [],
  academic_ict_faculty: [],
  academic_peer: [],
  academic_development_courses: [],
  academic_results: [],
  academic_toppers: [],
  academic_student_survey: [],
  academic_annual_report: [],
  academic_action_plan: [],
  academic_suggestion: [
    {
      stake_type: {
        type: String,
      },
      name: {
        type: String,
      },
      phone_number: {
        type: String,
      },
      email: {
        type: String,
      },
      subject: {
        type: String,
      },
      complaint: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model("Academic", academicSchema);
