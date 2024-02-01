const mongoose = require("mongoose");

const libraryStocktakeSchema = new mongoose.Schema({
  created_at: {
    type: Date,
    default: Date.now,
  },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
  book_isssue_count: {
    type: Number,
    default: 0,
  },
  book_lost_count: {
    type: Number,
    default: 0,
  },
  book_at_library_count: {
    type: Number,
    default: 0,
  },
  book_missing_count: {
    type: Number,
    default: 0,
  },
  book_isssue: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
  ],
  book_lost: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
  ],
  book_at_library: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
  ],
  book_missing: [
    {
      status: {
        type: String,
        default: "None",
      },
      //   "FOUNDED_AT_LIBRARY"||"LOST",||"ISSUE_STUDENT"
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    },
  ],
  // flow:  "book_isssue"|| "book_lost" ||"book_at_library" || "book_missing"
  is_process: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("LibraryStocktake", libraryStocktakeSchema);