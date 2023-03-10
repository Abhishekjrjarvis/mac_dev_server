const mongoose = require("mongoose");

const vacancySchema = new mongoose.Schema({
  vacancy_position: {
    type: String,
    required: true,
  },
  vacancy_job_type: {
    type: String,
  },
  vacancy_status: {
    type: String,
    default: "Ongoing",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  vacancy_package: {
    type: Number,
    default: 0,
  },
  vacancy_about: {
    type: String,
  },
  vacancy_banner: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  career: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LandingCareer",
  },
  application_count: {
    type: Number,
    default: 0,
  },
  application: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Career",
    },
  ],
});

module.exports = mongoose.model("Vacancy", vacancySchema);
