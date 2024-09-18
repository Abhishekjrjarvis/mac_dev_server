const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  agenda: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
  },
  discussion: {
    type: String,
  },
  mentees_present_count: {
    type: Number,
    default: 0,
  },
  mentees_absent_count: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  present_mentees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  absent_mentees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor",
  },
  meeting_alert: {
    type: Boolean,
    default: false,
  },
  creation_status: {
    type: String,
    default: "NORMAL",
  },
  meeting_time: {
    type: String,
  },
  meeting_date: {
    type: String,
  },
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Guide",
  },
});

module.exports = mongoose.model("Meeting", meetingSchema);
