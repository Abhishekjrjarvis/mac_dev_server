const mongoose = require("mongoose");

const libraryModeratorSchema = new mongoose.Schema({
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
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  department: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
  permission: {
    allow: { type: Boolean, default: true },
    bound: [],
    addons: [],
  },
});

module.exports = mongoose.model("LibraryModerator", libraryModeratorSchema);