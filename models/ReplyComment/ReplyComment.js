const mongoose = require("mongoose");
const Comment = require("../Comment");

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
    ref: "Comment",
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
  // modelId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true,
  //   refPath: "onModel",
  // },
  // onModel: {
  //   type: String,
  //   required: true,
  //   enum: ["User", "InstituteAdmin"],
  // },
});

module.exports = mongoose.model("ReplyComment", replySchema);
