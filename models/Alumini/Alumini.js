const mongoose = require("mongoose");

const aluminiSchema = new mongoose.Schema({
  alumini_head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  alumini_passage: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  register_form: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AluminiRegister",
    },
  ],
  register_form_count: {
    type: Number,
    default: 0,
  },
  certifcate_given_count: {
    type: Number,
    default: 0,
  },
  prominent_alumini: [
    {
      name: { type: String },
      profile_photo: { type: String },
      department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
      batch: { type: String },
      company_name: { type: String },
      job_profile: { type: String },
    },
  ],
  success_story_count: {
    type: Number,
    default: 0,
  },
  feed_back_received: {
    type: Number,
    default: 0,
  },
  feed_question_count: {
    type: Number,
    default: 0,
  },
  feed_question: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
    },
  ],
});

module.exports = mongoose.model("Alumini", aluminiSchema);
