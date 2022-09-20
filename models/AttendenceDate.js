const mongoose = require("mongoose");

const attendenceDateSchema = new mongoose.Schema({
  attendDate: {
    type: String,
    required: true,
  },
  attendTime: {
    type: String,
    required: true,
  },
  outTime: {
    type: String,
  },
  presentTotal: {
    type: Number,
    default: 0
  },

  absentTotal: {
    type: Number,
    default: 0
  },
  className: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  presentStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  absentStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
});

const AttendenceDate = mongoose.model("AttendenceDate", attendenceDateSchema);

module.exports = AttendenceDate;
