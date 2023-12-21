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
    ref: "Student",
  },
  // bookName: { type: String, required: true },
  // author: { type: String, required: true },
  // language: { type: String, required: true },
  // photoId: { type: String },
  // photoId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("IssueBook", issueBookSchema);
