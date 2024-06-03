const mongoose = require("mongoose");

const departmentStudentFormSchema = new mongoose.Schema({
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
  created_at: {
    type: Date,
    default: Date.now,
  },
  image_content: [
    {
      name: { type: String },
      attach: { type: String }
    }
  ],
    form_section: [
        {
            section_name: {
              type: String
            },
            section_visibilty: {
                type: Boolean,
                default: true
            },
            section_key: {
                type: String
            },
            section_date: {
                type: Date,
                default: Date.now
        },
        section_stats: {
          type: String
    },
    section_value: {
      type: String
    },
            form_checklist: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "FormChecklist"
                }
            ],
            ins_form_section_id: {
                type: String
        },
        section_view: {
          type: String
        },
        section_pdf: {
          type: String
        }
      }
  ]
});

module.exports = mongoose.model("DepartmentStudentForm", departmentStudentFormSchema);
