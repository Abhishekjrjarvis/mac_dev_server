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
  po_pso: [
    {
      title: {
        type: String
      },
      description: {
        type: String 
      }
    }
  ],
  syllabus: [
    {
      name: { type: String },
      attach: { type: String }
    }
  ],
  professional_body: [
    {
      title: {
        type: String
      },
      description: {
        type: String 
      },
      image: {
        type: String
      }
    }
  ],
  student_associations: [
    {
      title: {
        type: String
      },
      description: {
        type: String 
      },
      image: {
        type: String
      }
    }
  ],
  student_achievements: [
    {
      title: {
        type: String
      },
      description: {
        type: String 
      },
      image: {
        type: String
      }
    }
  ],
  innovative_practices: [
    {
      title: {
        type: String
      },
      description: {
        type: String 
      },
      image: {
        type: String
      }
    }
  ],
  projects: [
    {
      name: { type: String },
      attach: { type: String }
    }
  ],
});

module.exports = mongoose.model("DepartmentSite", departmentSiteSchema);
