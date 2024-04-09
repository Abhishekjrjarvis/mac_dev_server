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
vision: {
    type: Boolean,
    default: true
      },
      mission: {
        type: Boolean,
        default: true
      }, 
      affiliation: {
        type: Boolean,
        default: true
      }
  },
    
  about_society: {
    org_structure: {
        type: Boolean,
        default: true
    },
    vision: {
      type: Boolean,
      default: true
    },
    mission: {
      type: Boolean,
      default: true
    }, 
    founders_message: {
      type: Boolean,
      default: true
    }
  },

  administration: {
    type: Boolean,
    default: true
  },
  academic_courses: {
    type: Boolean,
    default: true
  },
  accreditations: {
    type: Boolean,
    default: true
  },
  founder_desk: [
    {
      video: { type: String },
      link: { type: String },
      image: { type: String },
      description: { type: String }
    }
  ],
  accreditations_desk: [
    {
      link: { type: String },
      image: { type: String }
    }
  ],
  gallery: [
    {
      category: { type: String },
      image: { type: String }
    }
  ],
  affiliation_name: {
    type: String
  },
  affiliation_logo: [],
  about_society_dynamic: {
    dynamic_name: {
      type: String
    },
    vision: {
      type: String
    },
    mission: {
      type: String
    },
    organisation_structure: {
      type: String
    },
    founder_message_image: {
      type: String
    },
    founder_message_designation: {
      type: String
    },
    founder_message_message: {
      type: String
    },
    founder_message_name: {
      type: String
    },
  }
  // administration: [
  //   {

  //   }
  // ]
});

module.exports = mongoose.model("LandingControl", landingControlSchema);
