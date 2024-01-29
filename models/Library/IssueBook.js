const mongoose = require("mongoose");

const issueBookSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
  staff_member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  // bookName: { type: String, required: true },
  // author: { type: String, required: true },
  // language: { type: String, required: true },
  // photoId: { type: String },
  // photoId: { type: String },
  createdAt: { type: Date, default: Date.now },
  issue_as: {
    type: String,
    default: "Normal",
  },
  day_overdue_charge: {
    type: Number,
    default: 0,
  },
  for_days: {
    type: String,
  },
});

module.exports = mongoose.model("IssueBook", issueBookSchema);
