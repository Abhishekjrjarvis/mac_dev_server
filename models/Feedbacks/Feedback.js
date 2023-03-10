const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  feedRating: {
    type: Number,
    default: 1,
    required: true,
  },
  feedTag: {
    type: String,
    required: true,
  },
  feedContent: {
    type: String,
    required: true,
  },
  feedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("FeedBack", feedbackSchema);
