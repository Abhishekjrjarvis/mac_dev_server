const mongoose = require("mongoose");

const collectBookSchema = new mongoose.Schema({
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
  chargeBy: {
    type: String,
  },
  paymentType: {
    type: String,
  },
  fineCharge: {
    type: Number,
    default: 0,
  },
  issuedDate: {
    type: Date,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CollectBook", collectBookSchema);
