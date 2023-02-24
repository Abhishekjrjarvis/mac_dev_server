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
  feedback: [],
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
});

module.exports = mongoose.model("Mentor", mentorSchema);
