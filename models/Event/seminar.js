const mongoose = require("mongoose");

const seminarSchema = new mongoose.Schema({
  for_department: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
  ],
  seminar_name: {
    type: String,
    required: true,
  },
  seminar_mode: {
    type: String,
  },
  seminar_joining_link: {
    type: String,
  },
  seminar_guest: {
    type: String,
  },
  seminar_date: {
    type: Date,
  },
  seminar_time: {
    type: Date,
  },
  seminar_status: {
    type: String,
    default: "UpComing",
  },
  seminar_place: {
    type: String,
  },
  seminar_description: {
    type: String,
  },
  seminar_banner: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  event_manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EventManager",
  },
});

module.exports = mongoose.model("Seminar", seminarSchema);
