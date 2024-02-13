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
  given_feedback: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentGiveFeedback",
    },
  ],
});

module.exports = mongoose.model("StudentFeedback", studentFeedbackSchema);