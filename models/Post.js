const mongoose = require("mongoose");

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
  isUser: {
    type: String,
  },
  isInstitute: {
    type: String
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
  postQuestion: {
    type: String
  },
  answerCount: {
    type: Number,
    default: 0
  },
  answer: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Answer'
    }
  ],
  answerUpVoteCount: {
    type: Number,
    default: 0
  },
  postType: {
    type: String,
    default: 'Post'
  },
  trend_category: [
    {
      categoryType: { type: String },
    },
  ],
  poll_query:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll'
  }
});

postSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Comment.deleteMany({
      _id: {
        $in: doc.comment,
      },
    });
    await Answer.deleteMany({
      _id: {
        $in: doc.answer,
      },
    });
  }
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
