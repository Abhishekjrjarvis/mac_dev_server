const mongoose = require("mongoose");

const libraryBookRemarkSchema = new mongoose.Schema({
  title: String,
  description: String,
  rating: {
    type: Number,
    default: 0,
  },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("LibraryBookRemark", libraryBookRemarkSchema);