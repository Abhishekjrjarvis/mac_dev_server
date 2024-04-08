const mongoose = require("mongoose");

const landingControlSchema = new mongoose.Schema({
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
    about_ins: {
        inst_profile: {
            type: Boolean,
            default: true
        },
        org_structure: {
            type: Boolean,
            default: true
      },
        aicte_approval: {
        type: Boolean,
        default: true
  },
  co_accredation: {
    type: Boolean,
    default: true
},
vision_mission: {
    type: Boolean,
    default: true
},
  },
});

module.exports = mongoose.model("LandingControl", landingControlSchema);
