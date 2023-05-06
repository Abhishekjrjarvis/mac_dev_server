const mongoose = require("mongoose");

const feedquestionSchema = new mongoose.Schema({
  feed_question: {
    type: String,
    required: true,
  },
  feed_answer: [
    {
      content: { type: String },
      percent_vote: { type: Number, default: 0 },
      color_type: { type: String, default: "#F0F0F0" },
      users: [],
      rating: { type: Number, default: 0 },
    },
  ],
  total_votes: {
    type: Number,
    default: 0,
  },
  answeredUser: [],
  created_at: {
    type: Date,
    default: Date.now,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
});

module.exports = mongoose.model("FeedQuestion", feedquestionSchema);
