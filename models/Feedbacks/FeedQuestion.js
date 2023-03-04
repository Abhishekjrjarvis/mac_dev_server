const mongoose = require("mongoose");

const feedquestionSchema = new mongoose.Schema({
  feed_question: {
    type: String,
    required: true,
  },
  feed_answer: [
    {
      content: { type: String },
      rating: { type: Number, default: 0 },
    },
  ],
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
