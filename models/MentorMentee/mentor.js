const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema({
  mentor_head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  mentees_count: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  mentees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  total_query_count: {
    type: Number,
    default: 0,
  },
  pending_query_count: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
  },
  queries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queries",
    },
  ],
  feed_question: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeedQuestion",
    },
  ],
  feed_question_count: {
    type: Number,
    default: 0,
  },
  total_feedback_count: {
    type: Number,
    default: 0,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
});

module.exports = mongoose.model("Mentor", mentorSchema);
