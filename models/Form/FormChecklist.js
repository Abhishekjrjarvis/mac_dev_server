const mongoose = require("mongoose");

const formChecklistSchema = new mongoose.Schema({
  form: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteStudentForm",
    },
    department_form: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DepartmentStudentForm"
    },
    application_form: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstituteApplicationForm"
    },
  created_at: {
    type: Date,
    default: Date.now,
    },
    form_checklist_name: {
      type: String
    },
    form_checklist_key: {
        type: String
    },
    form_checklist_visibility: {
        type: Boolean,
        default: true
    },
    form_checklist_placeholder: {
        type: String
    },
    form_checklist_lable: {
        type: String
    },
    form_checklist_typo: {
        type: String
    },
    form_checklist_typo_option_pl: [{
        type: String
    }],
    form_checklist_typo_option_pl_staff: [],
    form_section: {
        type: String
    },
    form_checklist_required: {
        type: Boolean,
        default: false
    },
    form_checklist_key_status: {
        type: String,
    },
    form_checklist_sample: {
        type: String
    },
    nested_form_checklist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "FormChecklist"
    }],
    nested_form_checklist_nested: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FormChecklist"
        }
    ],
    width: {
        type: String
    },
    form_checklist_typo_option_pl_optional: [],
    form_common_key: { type: String },
    form_checklist_enable: {
        type: String,
    }
});

module.exports = mongoose.model("FormChecklist", formChecklistSchema);
