const mongoose = require("mongoose");

const landingCareerSchema = new mongoose.Schema({
  career_head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  vacancy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vacancy",
    },
  ],
  admin_vacancy_count: {
    type: Number,
    default: 0,
  },
  staff_vacancy_count: {
    type: Number,
    default: 0,
  },
  other_vacancy_count: {
    type: Number,
    default: 0,
  },
  filled_vacancy_count: {
    type: Number,
    default: 0,
  },
  career_photo: {
    type: String,
  },
  photoId: {
    type: String,
  },
});

module.exports = mongoose.model("LandingCareer", landingCareerSchema);
