const mongoose = require("mongoose");

const staffAttendenceDateSchema = new mongoose.Schema({
  staffAttendDate: {
    type: String,
    required: true,
  },
  staffAttendTime: {
    type: Date,
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
      staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
      inTime: {
        type: String,
      },
      outTime: {
        type: String,
      },
      status: String,
    },
  ],
  absentStaff: [
    {
      staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
      inTime: {
        type: String,
      },
      outTime: {
        type: String,
      },
      status: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StaffAttendenceDate = mongoose.model(
  "StaffAttendenceDate",
  staffAttendenceDateSchema
);

module.exports = StaffAttendenceDate;
