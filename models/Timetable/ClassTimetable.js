const mongoose = require("mongoose");
const timetableSchema = new mongoose.Schema({
  day: String,
  date: String,
  schedule: [
    {
      from: {
        type: String,
        required: true,
      },
      subjectName: String,
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
      to: {
        type: String,
        required: true,
      },
      assignStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
      offStaff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
    },
  ],

  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ClassTimetable", timetableSchema);
