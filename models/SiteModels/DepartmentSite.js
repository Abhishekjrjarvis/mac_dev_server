const mongoose = require("mongoose");

const departmentSiteSchema = new mongoose.Schema({
  department_vission: { type: String },
  department_mission: { type: String },
  department_about: { type: String },
  department_image: { type: String },
  department_hod_message: { type: String },
  department_contact: [
    {
      contact_department_name: { type: String },
      contact_person_name: { type: String },
      contact_person_mobile: { type: String },
      contact_person_email: { type: String },
    },
  ],
  related_department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
});

module.exports = mongoose.model("DepartmentSite", departmentSiteSchema);
