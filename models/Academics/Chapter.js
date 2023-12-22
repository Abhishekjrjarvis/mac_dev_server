const mongoose = require("mongoose");
const ChapterTopic = require("./ChapterTopic");

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

chapterSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await ChapterTopic.deleteMany({
      _id: {
        $in: doc.topic,
      },
    });
  }
});

module.exports = mongoose.model("Chapter", chapterSchema);
