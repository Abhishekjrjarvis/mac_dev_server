const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  bookStatus: {
    type: String,
    default: "Offline",
  },
  author: { type: String, required: true },
  publication: { type: String },
  language: { type: String },
  totalPage: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  totalCopies: { type: Number, default: 1 },
  leftCopies: { type: Number, default: 1 },
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  subject: {
    type: String
  },
  bill_date: {
    type: String
  },
  bill_number: {
    type: String
  },
  purchase_order_date: {
    type: String
  },
  purchase_order_number: {
    type: String
  },
  supplier: {
    type: String
  },
  publisher_place: {
    type: String
  },
  publication_year: {
    type: String
  },
  edition: {
    type: String,
  },
  class_number: {
    type: String
  },
  accession_number: {
    type: String
  },
  date: {
    type: String
  },
  publisher: {
    type: String
  },
  qviple_book_id: {
    type: String,
    unique: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },
  book_qr_code: String,
  book_remark: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LibraryBookRemark",
    },
  ],
  book_remark_count: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: "Available",
  },
  book_type: {
    type: String
  }
});

module.exports = mongoose.model("Book", bookSchema);
