const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  bookStatus: {
    type: String,
    default: "Offline",
  },
  author: { type: String, required: true },
  publication: { type: String, required: true },
  language: { type: String, required: true },
  totalPage: { type: Number, required: true },
  price: { type: Number, required: true, default: 0 },
  totalCopies: { type: Number, required: true },
  leftCopies: { type: Number, required: true },
  shellNumber: { type: String, required: true },
  description: { type: String },
  attachment: [],
  photoId: { type: String },
  photo: { type: String },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
});

module.exports = mongoose.model("Book", bookSchema);
