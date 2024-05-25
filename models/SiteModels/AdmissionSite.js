const mongoose = require("mongoose");

const admissionSiteSchema = new mongoose.Schema({
  admission_about: { type: String },
  admission_process: { type: String },
  admission_contact: [
    {
      contact_department_name: { type: String },
      contact_person_name: { type: String },
      contact_person_mobile: { type: String },
      contact_person_email: { type: String },
    },
  ],
  related_admission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admission",
  },
  cashier_name: String,
  cashier_signature: String,
  video_gallery: [
    {
      title: { type: String },
      link: { type: String },
      video: { type: String }
    }
  ]
});

module.exports = mongoose.model("AdmissionSite", admissionSiteSchema);