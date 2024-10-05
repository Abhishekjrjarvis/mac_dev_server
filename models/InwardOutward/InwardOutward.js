const mongoose = require("mongoose");

const inwardOutwardSchema = new mongoose.Schema({
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  pulished: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OutwardCreate",
    },
  ],
  ready_to_pulish: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OutwardCreate",
    },
  ],
  outward: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OutwardCreate",
    },
  ],
  request: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InwardOutwardStaff",
    },
  ],
  outward_number: {
    type: Number,
    default: 0,
  },
  monthly_number_pattern: [],
  monthly_number: {
    type: Number,
    default: 0,
  },
  monthly_outward_number: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("InwardOutward", inwardOutwardSchema);
