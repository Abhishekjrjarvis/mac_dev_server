const mongoose = require("mongoose");

const classAttendanceTimeSlotSchema = new mongoose.Schema({
  date: String,
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  slot: [
    {
      date: String,
      from: String,
      to: String,
      register_subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
      is_mark: Boolean,
      is_extra: Boolean,
    },
  ],
});
module.exports = mongoose.model(
  "ClassAttendanceTimeSlot",
  classAttendanceTimeSlotSchema
);