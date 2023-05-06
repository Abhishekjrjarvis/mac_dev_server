const mongoose = require("mongoose");

const eventManagerSchema = new mongoose.Schema({
  event_head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  event_count: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  events: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
    },
  ],
  seminars: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seminar",
    },
  ],
  election: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
    },
  ],
  participate: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participate",
    },
  ],
  seminar_count: {
    type: Number,
    default: 0,
  },
  election_count: {
    type: Number,
    default: 0,
  },
  event_photo: {
    type: String,
  },
  photoId: {
    type: String,
  },
  participate_count: {
    type: Number,
    default: 0,
  },
  remaining_fee: {
    type: Number,
    default: 0,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
});

module.exports = mongoose.model("EventManager", eventManagerSchema);
