const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  bookStatus: {
    type: String,
    default: "Offline",
  },
  author: { type: String, required: true },
  publication: { type: String },
  language: { type: String, required: true },
  totalPage: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  totalCopies: { type: Number, default: 0 },
  leftCopies: { type: Number, default: 0 },
  shellNumber: { type: String },
  description: { type: String },
  attachment: [
    {
      documentType: {
        type: String,
      },
      documentName: {
        type: String,
      },
      documentSize: {
        type: String,
      },
      documentKey: {
        type: String,
      },
    },
  ],
  photoId: { type: String },
  photo: { type: String },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
});

module.exports = mongoose.model("Book", bookSchema);
