const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  repliedComment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserComment",
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("ReplyCommentUser", replySchema);
