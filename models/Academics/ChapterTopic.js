const mongoose = require("mongoose");

const chapterTopicSchema = new mongoose.Schema({
  topic_name: {
    type: String,
    required: true,
  },
  topic_last_date: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  topic_completion_date: {
    type: Date,
  },
  topic_completion_status: {
    type: String,
    default: "Pending",
  },
  topic_current_status: {
    type: String,
    default: "Ongoing",
  },
  topic_edited_status: {
    type: String,
  },
  course_outcome: {
    type: String,
  },
  learning_outcome: {
    type: String,
  },
  timing: {
    hours: {
      type: String,
    },
    minutes: {
      type: String,
    },
  },
  planning_date: {
    type: Date,
    default: Date.now,
  },
  execution_date: {
    type: Date,
    default: Date.now,
  },
  topic_last_date_format: {
    type: Date,
  },
  topic_link: {
    type: String,
  },
  topic_time_in_minutes: {
    type: String,
  },
  teaching_method: {
    type: String,
  },
});

module.exports = mongoose.model("ChapterTopic", chapterTopicSchema);
