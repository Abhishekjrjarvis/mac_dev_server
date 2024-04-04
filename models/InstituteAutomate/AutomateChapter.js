const mongoose = require("mongoose");

const automateChapterSchema = new mongoose.Schema({
  chapter_name: {
    type: String,
    required: true,
  },
  automate_subject_master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AutomateSubjectMaster",
  },
  topic: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AutomateChapterTopic",
    },
  ],
  topic_count: {
    type: Number,
    default: 0,
  },
  chapter_type: {
    type: String,
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
  chapter_link: {
    type: String,
  },
});

module.exports = mongoose.model("AutomateChapter", automateChapterSchema);
