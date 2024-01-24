const mongoose = require("mongoose");

const libraryInOutSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
  in_time: String,
  out_time: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
  hour_in_24: Number,
  minute_in: Number,
  second_in: Number,
  hour_out_24: Number,
  minute_out: Number,
  second_out: Number,
  is_valid: {
    type: String,
    default: 'No'
  },
});

module.exports = mongoose.model("LibraryInOut", libraryInOutSchema);