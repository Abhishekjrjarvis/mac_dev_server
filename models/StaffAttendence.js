const mongoose = require("mongoose");

const staffAttendenceSchema = new mongoose.Schema({
  staffAttendenceDate: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StaffAttendenceDate",
    },
  ],
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
});

const StaffAttendence = mongoose.model(
  "StaffAttendence",
  staffAttendenceSchema
);

module.exports = StaffAttendence;
