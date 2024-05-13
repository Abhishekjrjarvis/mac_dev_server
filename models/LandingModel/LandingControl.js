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
    about: {
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
  },
  academic_courses_desk: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicPage"
    }
  ],
  home_header_object: {
    ins_name: { type: String },
    ins_logo: { type: String },
    affiliation_logo: { type: String },
    ins_address: { type: String },
    affiliation_with: { type: String },
    ins_email: { type: String },
    ins_phone_number: { type: String },
    accreditations: { type: String }
  },
  home_background_object: {
    images: [],
    color_theme: { type: String }
  },
  home_about_institute_object: {
    about: { type: String },
    typo: { type: String },
    link_images: { type: String },
  },
  home_opener_quick_links: {
    link_1: {
      name: { type: String },
      typo: { type: String },
      link_images: { type: String }
    },
    link_2: {
      name: { type: String },
      typo: { type: String },
      link_images: { type: String }
    },
    link_3: {
      name: { type: String },
      typo: { type: String },
      link_images: { type: String }
    },
    link_4: {
      name: { type: String },
      typo: { type: String },
      link_images: { type: String }
    },
    link_5: {
      name: { type: String },
      typo: { type: String },
      link_images: { type: String }
    },
    link_6: {
      name: { type: String },
      typo: { type: String },
      link_images: { type: String }
    },
  },
  home_opener_background_object: {
    bg_1: {
      name: { type: String },
      typo: { type: String },
      link_images: { type: String },
      attach: { type: String }
    },
    bg_2: {
      name: { type: String },
      typo: { type: String },
      link_images: { type: String },
      attach: { type: String }
    },
  },
  home_accreditation_object: [
    {
      name: { type: String },
      image: { type: String },
      about: { type: String },
      c_name: { type: String },
      c_attach: { type: String },
      combined: [
        {
          c_name: String,
          c_attach: String
        }
      ]
    }
  ],
  footer_links: {
    linkedin_link: { type: String },
    instagram_link: { type: String },
    twitter_link: { type: String },
    qviple_link: { type: String },
    youtube_link: { type: String },
    facebook_link: { type: String }
  },
  about_us_institute_object: {
    ins_name: { type: String },
    ins_about: { type: String },
    vision: { type: String },
    mission: { type: String },
    org_structure: { type: String },
    affiliation: [
      {
        name: { type: String },
        info: { type: String }
      }
    ]
  },
  administration_object: [{
    leading_person: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    leading_person_position: { type: String },
    leading_person_message: { type: String },
  }],
  manual_examination: [
    {
      name: { type: String },
      attach: { type: String }
    },
  ],
  examination_schedule: [
    {
      name: { type: String },
      attach: { type: String }
    },
  ],
  examination_timetable: [
    {
      name: { type: String },
      attach: { type: String }
    },
  ],
  examination_notification: [
    {
      name: { type: String },
      attach: { type: String }
    },
  ]
});

module.exports = mongoose.model("LandingControl", landingControlSchema);
