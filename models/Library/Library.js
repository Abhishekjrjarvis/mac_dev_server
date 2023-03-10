const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema({
  libraryHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  coverId: { type: String },
  cover: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  issued: [{ type: mongoose.Schema.Types.ObjectId, ref: "IssueBook" }],
  collected: [{ type: mongoose.Schema.Types.ObjectId, ref: "CollectBook" }],
  bookCount: {
    type: Number,
    default: 0,
  },
  memberCount: {
    type: Number,
    default: 0,
  },
  totalFine: {
    type: Number,
    default: 0,
  },
  offlineFine: {
    type: Number,
    default: 0,
  },
  onlineFine: {
    type: Number,
    default: 0,
  },
  collectedFine: {
    type: Number,
    default: 0,
  },
  requestStatus: {
    type: String,
    default: "Pending",
  },
  exemptFine: {
    type: Number,
    default: 0,
  },
  charge_history: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollectBook",
    },
  ],
  createdAt: { type: Date, default: Date.now },
  site_info: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LibrarySite",
    },
  ],
});

module.exports = mongoose.model("Library", librarySchema);
