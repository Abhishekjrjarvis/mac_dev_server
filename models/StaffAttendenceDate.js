const mongoose = require("mongoose");

const staffAttendenceDateSchema = new mongoose.Schema({
  staffAttendDate: {
    type: String,
    required: true,
  },
  staffAttendTime: {
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

  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  presentStaff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  absentStaff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
});

const StaffAttendenceDate = mongoose.model(
  "StaffAttendenceDate",
  staffAttendenceDateSchema
);

module.exports = StaffAttendenceDate;
