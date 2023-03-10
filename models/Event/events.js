const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  for_department: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
  ],
  event_name: {
    type: String,
    required: true,
  },
  event_guest: {
    type: String,
  },
  event_date: {
    type: Date,
  },
  event_time: {
    type: Date,
  },
  event_status: {
    type: String,
    default: "UpComing",
  },
  event_place: {
    type: String,
  },
  event_description: {
    type: String,
  },
  event_banner: {
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

module.exports = mongoose.model("Events", eventSchema);
