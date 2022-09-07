const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  commentDescription: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  author: {
    type: String,
  },
  authorName: {
    type: String
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
  childComment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReplyComment",
    },
  ],
  parentCommentLike: [],
  allLikeCount: {
    type: Number,
    default: 0,
  },
  allChildCommentCount: {
    type: Number,
    default: 0,
  },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
