const mongoose = require("mongoose");

const notExistStudentCertificateSchema = new mongoose.Schema({
  studentCertificateNo: String,
  leaving_date: String,
  studentBookNo: String,
  studentUidaiNumber: String,
  studentPreviousSchool: String,
  studentLeavingBehaviour: String,
  studentLeavingStudy: String,
  studentLeavingReason: String,
  studentRemark: String,
  instituteJoinDate: String,
  studentLeavingInsDate: String,
  leaving_degree: String,
  leaving_since_date: String,
  leaving_course_duration: String,
  elective_subject_one: String,
  elective_subject_second: String,
  leaving_project_work: String,
  leaving_guide_name: String,
  lcRegNo: String,
  lcCaste: String,
  lcBirth: String,
  lcDOB: String,
  lcAdmissionDate: String,
  lcInstituteDate: String,
  leaving_student_name: String,
  leaving_nationality: String,
  leaving_religion: String,
  leaving_previous_school: String,
  leaving_certificate_attach: String,
  certificate_type: String,
  certificate_attachment: String,
  is_dublicate: String,
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  issue_by_staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  issue_by_institute: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  certificate_logs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteCertificateLog",
    },
  ],
});

module.exports = mongoose.model(
  "NotExistStudentCertificate",
  notExistStudentCertificateSchema
);

