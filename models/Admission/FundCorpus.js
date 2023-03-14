const mongoose = require("mongoose");

const fundCorpusSchema = new mongoose.Schema({
  unused_corpus: {
    type: Number,
    default: 0,
  },
  total_corpus: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  fund_history: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Income",
    },
  ],
  fund_history_count: {
    type: Number,
    default: 0,
  },
  scholarship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ScholarShip",
  },
});

module.exports = mongoose.model("FundCorpus", fundCorpusSchema);
