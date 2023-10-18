const mongoose = require("mongoose");

const oneSiteSchema = new mongoose.Schema({
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  organise_structure: [],
});

module.exports = mongoose.model("OneSite", oneSiteSchema);
