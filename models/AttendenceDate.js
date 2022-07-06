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
    type: String,
  },

  absentTotal: {
    type: String,
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
