const mongoose = require("mongoose");

const attendenceDateSchema = new mongoose.Schema({
  attendDate: {
    type: String,
    required: true,
  },
  attendTime: {
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
  className: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  presentStudent: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      inTime: {
        type: String,
      },
      outTime: {
        type: String,
      },
      status: String,
    },
  ],
  absentStudent: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
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
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
  },
  seating: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seating",
  },
  related_subjects: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
      status: String,
    },
  ],
  attendence_type: {
    type: String,
    default: "Normal_Lecture"
  },
  attendence_name: {
    type: String,
  },
  from: {
    type: String,
  },
  to: {
    type: String
  }
});

const AttendenceDate = mongoose.model("AttendenceDate", attendenceDateSchema);

module.exports = AttendenceDate;
