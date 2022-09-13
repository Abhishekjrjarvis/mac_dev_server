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
  libraryHeadTitle: {
    type: String,
  },
  emailId: { type: String },
  phoneNumber: { type: String },
  about: { type: String },
  photoId: { type: String },
  photo: { type: String },
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
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Library", librarySchema);
