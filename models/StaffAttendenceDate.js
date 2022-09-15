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
    type: Number,
    default: 0,
  },

  absentTotal: {
    type: Number,
    default: 0,
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
