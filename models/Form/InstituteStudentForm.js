const mongoose = require("mongoose");

const instituteStudentFormSchema = new mongoose.Schema({
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
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
            ]
      }
  ]
});

module.exports = mongoose.model("InstituteStudentForm", instituteStudentFormSchema);