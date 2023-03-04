const mongoose = require("mongoose");

const admissionModeratorSchema = new mongoose.Schema({
  access_role: {
    type: String,
    required: true,
  },
  access_staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  access_application: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewApplication",
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
  permission: {
    allow: { type: Boolean, default: true },
    bound: [],
    addons: [],
  },
  admission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admission",
  },
});

module.exports = mongoose.model("AdmissionModerator", admissionModeratorSchema);
