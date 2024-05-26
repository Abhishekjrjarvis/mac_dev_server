const mongoose = require("mongoose");

const instituteCertificateLogSchema = new mongoose.Schema({
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
  },
  institute_log_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteLog",
  },
  student_name: String,
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  certificate_attachment: String,
  certificate_type: String,
  certificate_issue_type: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
  issue_by_staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  issue_by_institute: {
    type: String,
  },
});

module.exports = mongoose.model(
  "InstituteCertificateLog",
  instituteCertificateLogSchema
);