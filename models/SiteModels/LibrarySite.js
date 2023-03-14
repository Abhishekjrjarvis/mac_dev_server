const mongoose = require("mongoose");

const librarySiteSchema = new mongoose.Schema({
  library_message: { type: String },
  library_rule: { type: String },
  library_image: { type: String },
  library_timing: { type: String },
  library_contact: [
    {
      contact_department_name: { type: String },
      contact_person_name: { type: String },
      contact_person_mobile: { type: String },
      contact_person_email: { type: String },
    },
  ],
});

module.exports = mongoose.model("LibrarySite", librarySiteSchema);
