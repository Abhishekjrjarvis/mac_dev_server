const mongoose = require("mongoose");

const answerReplySchema = new mongoose.Schema({
  answerReplyContent: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Answer",
    required: true,
  },
  author: {
    type: String,
  },
  authorName: {
    type: String,
  },
  authorUserName: {
    type: String
  },
  authorPhotoId: {
    type: String
  },
  authorProfilePhoto: {
    type: String
  },
  authorOneLine: {
    type: String
  },
  answer_content_reply_transcript: { type: String }
});

module.exports = mongoose.model("AnswerReply", answerReplySchema);
