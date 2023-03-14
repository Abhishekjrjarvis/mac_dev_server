const mongoose = require("mongoose");

const scholarshipSchema = new mongoose.Schema({
  scholarship_name: {
    type: String,
    required: true,
  },
  scholarship_about: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  scholarship_fee_category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeCategory",
    },
  ],
  scholarship_notification: {
    flow: { type: String },
    notification: { type: String },
  },
  scholarship_apply: {
    flow: { type: String },
    apply: { type: String },
  },
  admission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admission",
  },
  scholarship_status: {
    type: String,
    default: "Not Completed",
  },
  scholarship_candidates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeReceipt",
    },
  ],
  scholarship_candidates_count: {
    type: Number,
    default: 0,
  },
  fund_corpus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FundCorpus",
  },
});

module.exports = mongoose.model("ScholarShip", scholarshipSchema);
