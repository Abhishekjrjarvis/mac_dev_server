const mongoose = require("mongoose");

const hashTagSchema = new mongoose.Schema({
  hashtag_name: {
    type: String,
    required: true,
  },
  hashtag_profile_photo: {
    type: String,
  },
  hashtag_about: {
    type: String,
  },
  hashtag_follower_count: {
    type: Number,
    default: 0,
  },
  hashtag_question_count: {
    type: Number,
    default: 0,
  },
  hashtag_repost_count: {
    type: Number,
    default: 0,
  },
  hashtag_poll_count: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  hashtag_follower: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  hashtag_post: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  hashtag_trend: {
    type: String,
    default: "Not on Trending",
  },
});

module.exports = mongoose.model("HashTag", hashTagSchema);
