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
  flow: {
    type: String
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
        section_stats: {
              type: String
        },
        section_value: {
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
            status: {
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

module.exports = mongoose.model("InstituteStudentForm", instituteStudentFormSchema);
