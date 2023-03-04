const mongoose = require("mongoose");

const landingTenderSchema = new mongoose.Schema({
  tender_head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  tender: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tender",
    },
  ],
  open_tender_count: {
    type: Number,
    default: 0,
  },
  closed_tender_count: {
    type: Number,
    default: 0,
  },
  tender_photo: {
    type: String,
  },
  photoId: {
    type: String,
  },
});

module.exports = mongoose.model("LandingTender", landingTenderSchema);
