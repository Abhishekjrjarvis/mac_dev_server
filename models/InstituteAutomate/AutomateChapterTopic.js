const mongoose = require("mongoose");

const automateChapterTopicSchema = new mongoose.Schema({
  topic_name: {
    type: String,
    required: true,
  },
  topic_last_date: {
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
  topic_last_date_format: {
    type: Date,
  },
  topic_type: {
    type: String,
  },
  automate_chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AutomateChapter",
  },
  automate_subject_master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AutomateSubjectMaster",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  created_by: {
    type: String,
    // Admin or other institute
    default: "Admin",
  },
  topic_link: {
    type: String,
  },
});

module.exports = mongoose.model(
  "AutomateChapterTopic",
  automateChapterTopicSchema
);
