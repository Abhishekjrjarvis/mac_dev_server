const mongoose = require("mongoose");

const attendanceTeachingPlanHistorySchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  topic_reschedule: [
    {
      topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChapterTopic",
      },
      previous_date: {
        type: Date,
      },
      next_date: {
        type: Date,
      },
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "AttendanceTeachingPlanHistory",
  attendanceTeachingPlanHistorySchema
);
