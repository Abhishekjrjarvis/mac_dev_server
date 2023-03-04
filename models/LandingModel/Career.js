const mongoose = require("mongoose");

const careerSchema = new mongoose.Schema({
  endUserName: {
    type: String,
    required: true,
  },
  endUserDOB: {
    type: String,
  },
  endUserPhoneNumber: {
    type: String,
    required: true,
  },
  endUserAddress: {
    type: String,
    required: true,
  },
  endUserResume: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  endUserStatus: {
    type: String,
    default: "Applied",
  },
  endUserEmail: {
    type: String,
  },
  vacancy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vacancy",
  },
  interview_type: {
    type: String,
  },
  interview_date: {
    type: String,
  },
  interview_time: {
    type: String,
  },
  interview_place: {
    type: String,
  },
  interview_link: {
    type: String,
  },
  interview_guidelines: {
    type: String,
  },
});

module.exports = mongoose.model("Career", careerSchema);
