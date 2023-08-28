const mongoose = require("mongoose");

const hoselSiteSchema = new mongoose.Schema({
  hostel_about: { type: String },
  hostel_process: { type: String },
  hostel_contact: [
    {
      contact_department_name: { type: String },
      contact_person_name: { type: String },
      contact_person_mobile: { type: String },
      contact_person_email: { type: String },
    },
  ],
  related_hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
  },
  cashier_name: String,
  cashier_signature: String,
});

module.exports = mongoose.model("HostelSite", hoselSiteSchema);
