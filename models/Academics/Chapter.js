const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  chapter_name: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  topic: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChapterTopic",
    },
  ],
  topic_count: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Chapter", chapterSchema);
