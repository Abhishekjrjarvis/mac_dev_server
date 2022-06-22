const mongoose = require("mongoose");
const Comment = require("./Comment");
const User = require("./User");

const postSchema = new mongoose.Schema({
  postTitle: {
    type: String,
  },
  postDescription: {
    type: String,
  },
  postImage: [],
  imageId: {
    type: String,
  },
  postVideo: {
    type: String,
  },
  postStatus: {
    type: String,
    default: "Anyone",
  },
  tagPeople: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  likeCount: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  endUserLike: [],
  endUserSave: [],
  createdAt: {
    type: Date,
    default: Date.now,
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
  comment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

postSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Comment.deleteMany({
      _id: {
        $in: doc.comment,
      },
    });
  }
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
