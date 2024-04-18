const mongoose = require("mongoose")

const customAuthoritySchema = new mongoose.Schema({
    custom_head_name: {
        type: String,
      },
      custom_title_person: {
        type: String,
      },
      custom_head_person: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Staff"
      },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstituteAdmin"
    },
    iqac: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "IQAC"
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    composition: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student"
            },
            staff: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Staff"
            },
            designation: {
                type: String
            }
        }
    ],
    syllabus_feedback_object: [
        {
          name: { type: String },
          image: { type: String },
          about: { type: String },
          c_name: { type: String },
          c_attach: { type: String },
          combined: [
            {
              c_name: String,
              c_attach: String
            }
            ],
            flow: {
              type: String
          }
        }
    ],
    academic_calendar: [
        {
            name: { type: String },
            attach: { type: String }
        }
    ],
    iqac_aqar: [
        {
            name: { type: String },
            attach: { type: String }
        }
    ],
    iqac_reports: [
        {
            name: { type: String },
            attach: { type: String }
        }
    ],
    ssr_reports: [
        {
            name: { type: String },
            attach: { type: String }
        }
    ],
    ssr_documents: [
        {
            name: { type: String },
            attach: { type: String }
        }
    ],
    student_satisfactory: [
        {
            name: { type: String },
            attach: { type: String }
        }
    ],
    annual_reports: [
        {
            name: { type: String },
            attach: { type: String }
        }
    ],
    naac: [
        {
            name: { type: String },
            attach: { type: String },
            description: { type: String },
        }
    ],
    iqac: [
        {
            name: { type: String },
            attach: { type: String },
            description: { type: String },
        }
    ],
    idd: [
        {
            name: { type: String },
            attach: { type: String },
        }
    ],
    ipp: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AcademicNestedPage"
        }
    ],
    tab_manage: {
        composition_tab: { type: Boolean, default: true },
        syllabus_feedback_tab: { type: Boolean, default: true },
        academic_calendar_tab: { type: Boolean, default: true },
        iqac_aqar_tab: { type: Boolean, default: true },
        iqac_reports_tab: { type: Boolean, default: true },
        ssr_reports_tab: { type: Boolean, default: true },
        ssr_documents_tab: { type: Boolean, default: true },
        student_satisfactory_tab: { type: Boolean, default: true },
        annual_reports_tab: { type: Boolean, default: true },
        naac_tab: { type: Boolean, default: true },
        iqac_tab: { type: Boolean, default: true },
        status_tab: { type: Boolean, default: true },
        validity_tab: { type: Boolean, default: true },
        idd_tab: { type: Boolean, default: true },
    }
})

module.exports = mongoose.model("CustomAuthority", customAuthoritySchema)