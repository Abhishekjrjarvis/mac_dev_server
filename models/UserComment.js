const mongoose = require("mongoose");
const UserPost = require("./userPost");
const InstituteAdmin = require("./InstituteAdmin");
const User = require("./User");
const ReplyCommentUser = require("./ReplyComment/ReplyCommentUser");
const userCommentSchema = new mongoose.Schema({
  userCommentDesc: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userpost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserPost",
  },
  // userInstitute: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "InstituteAdmin",
  // },
  users: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  childComment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReplyCommentUser",
    },
  ],
  parentCommentLike: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  allLikeCount: {
    type: Number,
    default: 0,
  },
  allChildCommentCount: {
    type: Number,
    default: 0,
  },
});

const UserComment = mongoose.model("UserComment", userCommentSchema);

module.exports = UserComment;
