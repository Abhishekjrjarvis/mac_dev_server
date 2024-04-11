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
});

module.exports = mongoose.model("FormChecklist", formChecklistSchema);
