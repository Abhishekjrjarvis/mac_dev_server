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
  staff_member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  collect_as: {
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

module.exports = mongoose.model("CollectBook", collectBookSchema);
