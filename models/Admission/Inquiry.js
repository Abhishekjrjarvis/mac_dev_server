const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
  inquiry_application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NewApplication",
  },
  inquiry_student_name: { type: String, required: true },
  inquiry_student_gender: { type: String, required: true },
  inquiry_student_dob: { type: String, required: true },
  inquiry_student_address: { type: String, required: true },
  inquiry_student_photo: { type: String, required: true },
  inquiry_student_mobileNo: { type: String },
  inquiry_student_previous: { type: String },
  inquiry_student_remark: { type: String },
  reviewAt: {
    type: Date,
  },
  inquiry_status: {
    type: String,
    default: "Ongoing",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  admissionAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admission",
  },
});

module.exports = mongoose.model("Inquiry", inquirySchema);
