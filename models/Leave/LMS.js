const mongoose = require("mongoose");

const lmsSchema = new mongoose.Schema({
  active_staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  all_staff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  all_staff_count: {
    type: Number,
    default: 0,
  },
  leave_moderator_role: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinanceModerator",
    },
  ],
  leave_moderator_role_count: {
    type: Number,
    default: 0,
  },
  tab_manage: {
    all_staff: {
      type: Boolean,
      default: true,
    },
    all_moderator: {
      type: Boolean,
      default: true,
    },
    request_tab: {
      type: Boolean,
      default: true,
    },
    manage_coff: {
      type: Boolean,
      default: true,
    },
    biometric: {
      type: Boolean,
      default: true,
    },
    attendance: {
      type: Boolean,
      default: true,
    },
    configurations: {
      type: Boolean,
      default: true,
    },
    data_export: {
      type: Boolean,
      default: true,
    },
    request_leave: {
      type: Boolean,
      default: true,
    },
    issued_leave: {
      type: Boolean,
      default: true,
    },
    leave_allottment: {
      type: Boolean,
      default: true,
    },
    leave_set_off_rule: {
      type: Boolean,
      default: true,
    },
    holiday: {
      type: Boolean,
      default: true,
    },
    all_leave: {
      type: Boolean,
      default: true,
    },
    biometric_linking: {
      type: Boolean,
      default: true,
    },
  },
  leave: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave",
    },
  ],
  leave_config: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LeaveConfig",
  },
  leave_mods_access: {
    recommend: {
      type: Boolean,
      default: true,
    },
    review: {
      type: Boolean,
      default: true,
    },
    sanction: {
      type: Boolean,
      default: true,
    },
  },
  c_off_leave: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave",
    },
  ],
  biometric_staff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  leave_manage: {
    casual_leave: { type: Boolean, default: true },
    medical_leave: { type: Boolean, default: true },
    sick_leave: { type: Boolean, default: true },
    off_duty_leave: { type: Boolean, default: true },
    c_off_leave: { type: Boolean, default: true },
    lwp_leave: { type: Boolean, default: true },
    leave_taken: { type: Boolean, default: true },
    commuted_leave: { type: Boolean, default: true },
    maternity_leave: { type: Boolean, default: true },
    paternity_leave: { type: Boolean, default: true },
    study_leave: { type: Boolean, default: true },
    half_pay_leave: { type: Boolean, default: true },
    quarantine_leave: { type: Boolean, default: true },
    sabbatical_leave: { type: Boolean, default: true },
    special_disability_leave: { type: Boolean, default: true },
    winter_vacation_leave: { type: Boolean, default: true },
    summer_vacation_leave: { type: Boolean, default: true },
    child_adoption_leave: { type: Boolean, default: true },
    bereavement_leave: { type: Boolean, default: true },
  },
  export_collection: [
    {
      excel_type: {
        type: String,
      },
      excel_file: { type: String },
      excel_file_name: { type: String },
      created_at: { type: Date, default: Date.now },
    },
  ],
  export_collection_count: {
    type: Number,
    default: 0,
  },
  import_collection: [
    {
      excel_type: {
        type: String,
      },
      excel_file: { type: String },
      created_at: { type: Date, default: Date.now },
      status: {
        type: String,
      },
    },
  ],
  import_collection_count: {
    type: Number,
    default: 0,
  },
  leave_number: {
    type: Number,
    default: 0,
  },
  monthly_number_pattern: [],
  monthly_number: {
    type: Number,
    default: 0,
  },
  monthly_leave_number: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("LMS", lmsSchema);
