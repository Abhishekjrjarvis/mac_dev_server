const mongoose = require("mongoose");

const hostelRoomSchema = new mongoose.Schema({
  room_name: {
    type: String,
    required: true,
  },
  room_strength: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  hostelUnit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HostelUnit",
  },
  bed_count: {
    type: Number,
    default: 0,
  },
  vacant_count: {
    type: Number,
    default: 0,
  },
  photoId: {
    type: String,
  },
  room_photo: {
    type: String,
  },
  beds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HostelBed",
    },
  ],
});

module.exports = mongoose.model("HostelRoom", hostelRoomSchema);
