const mongoose = require("mongoose");

const studentFeedbackSchema = new mongoose.Schema({
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
        },
      ],
    },
  ],

  created_at: {
    type: Date,
    default: Date.now,
  },
  evaluation: {
    type: Boolean,
    default: false,
  },

  question_count: {
    type: Number,
    default: 0,
  },
  how_many_question_option: {
    type: Number,
    default: 5,
  },
  send_notification: {
    type: Boolean,
    default: false,
  },
  feedback_take_date: {
    type: Date,
  },
  feedback_close_at: {
    type: Date,
  },
  feedback_notify: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentNotification",
    },
  ],
  feedback_notify_count: {
    type: Number,
    default: 0,
  },
  given_feedback: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentGiveFeedback",
    },
  ],
  feedback_given_student_count: {
    type: Number,
    default: 0,
  },

  feedback_staff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StaffStudentFeedback",
    },
  ],
  analytic_evaluation: {
    type: Boolean,
    default: false,
  },
  export_collection: [
    {
      excel_type: {
        type: String,
      },
      excel_file: { type: String },
      excel_file_name: { type: String },
      created_at: { type: Date, default: Date.now },
      department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    },
  ],
  export_collection_count: {
    type: Number,
    default: 0,
  },
  cls_student: [
    {
      class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
      sent: Boolean,
      staff: [],
      student: [],
    },
  ],
});

module.exports = mongoose.model("StudentFeedback", studentFeedbackSchema);
// studentFeedbackSchema.virtual("feedback_notify_count1").get(function () {
//   return this.feedback_notify?.length - 20;
// });
