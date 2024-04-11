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
            form_checklist: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "FormChecklist"
                }
            ],
            ins_form_section_id: {
                type: String
            }
      }
  ]
});

module.exports = mongoose.model("DepartmentStudentForm", departmentStudentFormSchema);
