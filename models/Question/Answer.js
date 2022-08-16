const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  answerContent: {
    type: String,
    required: true,
  },
  answerImageId: {
    type: String
  },
  answerImage: [],
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
  answerReply: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AnswerReply",
    },
  ],
  upVote: [],
  downVote: [],
  upVoteCount: {
    type: Number,
    default: 0
  },
  downVoteCount: {
    type: Number,
    default: 0
  },
  answerReplyCount: {
    type: Number,
    default: 0
  },
  answerSave:[],
  isMentor: {
    type: String,
    default: 'No'
  }
});


answerSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await AnswerReply.deleteMany({
      _id: {
        $in: doc.answerReply,
      },
    });
  }
});

const Answer = mongoose.model("Answer", answerSchema);

module.exports = Answer;
