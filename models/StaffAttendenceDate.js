const mongoose = require("mongoose");

const staffAttendenceDateSchema = new mongoose.Schema({
  staffAttendDate: {
    type: String,
    required: true,
  },
  staffAttendTime: {
    type: Date,
    default: Date.now,
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
  attendence_type: {
    type: String,
    default: "Normal_Lecture"
  }
});

const StaffAttendenceDate = mongoose.model(
  "StaffAttendenceDate",
  staffAttendenceDateSchema
);

module.exports = StaffAttendenceDate;
