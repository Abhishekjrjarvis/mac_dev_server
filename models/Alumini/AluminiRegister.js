const mongoose = require("mongoose");

const aluminiRegisterSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  name: {
    type: String,
  },
  phone_number: {
    type: String,
  },
  graduation_department: {
    type: String,
  },
  pass_year: {
    type: String,
  },
  job_status: {
    type: String,
  },
  company_name: {
    type: String,
  },
  company_location: {
    type: String,
  },
  higher_study: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  alumini: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alumini",
  },
  certificate_status: {
    type: String,
    default: "Not Given",
  },
});

module.exports = mongoose.model("AluminiRegister", aluminiRegisterSchema);
