const mongoose = require("mongoose");

const financeModeratorSchema = new mongoose.Schema({
  access_role: {
    type: String,
    required: true,
  },
  access_staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  permission: {
    allow: { type: Boolean, default: true },
    bound: [],
    addons: [],
  },
  finance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Finance",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
  },
  pending_all_student_fee_custom_filter: {
    gender: {
      type: String,
    },
    cast_category: {
      type: String,
    },
    department: [],
    batch: [],
    master: [],
  },
  pending_all_student_fee_cert_custom_filter: {
    gender: {
      type: String,
    },
    cast_category: {
      type: String,
    },
    department: [],
    batch: [],
    master: [],
  },
  pending_all_student_fee_id_card_custom_filter: {
    gender: {
      type: String,
    },
    cast_category: {
      type: String,
    },
    department: [],
    batch: [],
    master: [],
  },
  social_media_password_query: {
    type: String,
  },
});

module.exports = mongoose.model("FinanceModerator", financeModeratorSchema);
