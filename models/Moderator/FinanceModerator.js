const mongoose = require("mongoose");

const financeModeratorSchema = new mongoose.Schema({
  access_role: {
    type: String,
    required: true,
  },
  access_staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  permission: {
    allow: { type: Boolean, default: true },
    bound: [],
    addons: [],
  },
  finance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Finance",
  },
});

module.exports = mongoose.model("FinanceModerator", financeModeratorSchema);
