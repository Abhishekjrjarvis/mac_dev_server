
const mongoose = require("mongoose");

const sportSchema = new mongoose.Schema({
  sportHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  sportName: { type: String },
  sportPhoneNumber: { type: Number },
  sportEmail: { type: String },
  sportAbout: { type: String },
  photoId: { type: String, default: "1" },
  photo: { type: String },
  coverId: { type: String, default: "2" },
  cover: { type: String },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  sportClass: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportClass",
    },
  ],
  sportEvent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportEvent",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  sportClassCount: {
    type: Number,
    default: 0
  },
  sportEventCount: {
    type: Number,
    default: 0
  }
});

const Sport = mongoose.model("Sport", sportSchema);

module.exports = Sport;

