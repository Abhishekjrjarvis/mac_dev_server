
const mongoose = require("mongoose");

const sportClassSchema = new mongoose.Schema({
  photoId: { type: String, default: "1" },
  photo: { type: String },
  coverId: { type: String, default: "2" },
  cover: { type: String },
  sportClassName: {
    type: String,
    required: true,
  },
  sportClassHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  sportClassAbout: {
    type: String,
  },
  sportClassEmail: {
    type: String,
  },
  sportClassPhoneNumber: {
    type: String,
  },
  sportClassProfilePhoto: {
    type: String,
  },
  sportClassCoverPhoto: {
    type: String,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  sportDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sport",
  },
  sportStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  sportTeam: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportTeam",
    },
  ],
});

const SportClass = mongoose.model("SportClass", sportClassSchema);

module.exports = SportClass;
