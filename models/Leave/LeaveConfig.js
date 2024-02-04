const mongoose = require("mongoose")

const leaveConfigSchema = new mongoose.Schema({
    staff_leave_config: {
        casual_leave: {
          type: Number,
          default: 0
        },
        casual_leave_approval: {
          type: Boolean,
          default: false
        },
        casual_leave_forward: {
          type: Boolean,
          default: false
        },
        medical_leave: {
          type: Number,
          default: 0
    },
   medical_leave_approval: {
      type: Boolean,
      default: false
    },
   medical_leave_forward: {
      type: Boolean,
      default: false
    },
        sick_leave: {
          type: Number,
          default: 0
        },
        sick_leave_approval: {
          type: Boolean,
          default: false
        },
       sick_leave_forward: {
          type: Boolean,
          default: false
        },
        commuted_leave: {
            type: Number,
            default: 0
    },
    commuted_leave_approval: {
      type: Boolean,
      default: false
    },
   commuted_leave_forward: {
      type: Boolean,
      default: false
    },
          maternity_leave: {
            type: Number,
            default: 0
    },
    maternity_leave_approval: {
      type: Boolean,
      default: false
    },
   maternity_leave_forward: {
      type: Boolean,
      default: false
    },
          paternity_leave: {
            type: Number,
            default: 0
    },
    paternity_leave_approval: {
      type: Boolean,
      default: false
    },
   paternity_leave_forward: {
      type: Boolean,
      default: false
    },
          study_leave: {
            type: Number,
            default: 0
    },
    study_leave_approval: {
      type: Boolean,
      default: false
    },
   study_leave_forward: {
      type: Boolean,
      default: false
    },
          half_pay_leave: {
            type: Number,
            default: 0
    },
    half_pay_leave_approval: {
      type: Boolean,
      default: false
    },
   half_pay_leave_forward: {
      type: Boolean,
      default: false
    },
          quarantine_leave: {
            type: Number,
            default: 0
    },
    quarantine_leave_approval: {
      type: Boolean,
      default: false
    },
   quarantine_leave_forward: {
      type: Boolean,
      default: false
    },
          sabbatical_leave: {
            type: Number,
            default: 0
    },
    sabbatical_leave_approval: {
      type: Boolean,
      default: false
    },
   sabbatical_leave_forward: {
      type: Boolean,
      default: false
    },
          special_disability_leave: {
            type: Number,
            default: 0
    },
    special_disability_leave_approval: {
      type: Boolean,
      default: false
    },
   special_disability_leave_forward: {
      type: Boolean,
      default: false
    },
          winter_vacation_leave: {
            type: Number,
            default: 0
    },
    winter_vacation_leave_approval: {
      type: Boolean,
      default: false
    },
   winter_vacation_leave_forward: {
      type: Boolean,
      default: false
    },
          summer_vacation_leave: {
            type: Number,
            default: 0
    },
    summer_vacation_leave_approval: {
      type: Boolean,
      default: false
    },
   summer_vacation_leave_forward: {
      type: Boolean,
      default: false
    },
          child_adoption_leave: {
            type: Number,
            default: 0
    },
    child_adoption_leave_approval: {
      type: Boolean,
      default: false
    },
   child_adoption_leave_forward: {
      type: Boolean,
      default: false
    },
          bereavement_leave: {
            type: Number,
            default: 0
    },
    bereavement_leave_approval: {
      type: Boolean,
      default: false
    },
   bereavement_leave_forward: {
      type: Boolean,
      default: false
    },
  },
  staff_leave_config_non_teaching: {
    casual_leave: {
      type: Number,
      default: 0
    },
    casual_leave_approval: {
      type: Boolean,
      default: false
    },
    casual_leave_forward: {
      type: Boolean,
      default: false
    },
    medical_leave: {
      type: Number,
      default: 0
},
medical_leave_approval: {
  type: Boolean,
  default: false
},
medical_leave_forward: {
  type: Boolean,
  default: false
},
    sick_leave: {
      type: Number,
      default: 0
    },
    sick_leave_approval: {
      type: Boolean,
      default: false
    },
   sick_leave_forward: {
      type: Boolean,
      default: false
    },
    commuted_leave: {
        type: Number,
        default: 0
},
commuted_leave_approval: {
  type: Boolean,
  default: false
},
commuted_leave_forward: {
  type: Boolean,
  default: false
},
      maternity_leave: {
        type: Number,
        default: 0
},
maternity_leave_approval: {
  type: Boolean,
  default: false
},
maternity_leave_forward: {
  type: Boolean,
  default: false
},
      paternity_leave: {
        type: Number,
        default: 0
},
paternity_leave_approval: {
  type: Boolean,
  default: false
},
paternity_leave_forward: {
  type: Boolean,
  default: false
},
      study_leave: {
        type: Number,
        default: 0
},
study_leave_approval: {
  type: Boolean,
  default: false
},
study_leave_forward: {
  type: Boolean,
  default: false
},
      half_pay_leave: {
        type: Number,
        default: 0
},
half_pay_leave_approval: {
  type: Boolean,
  default: false
},
half_pay_leave_forward: {
  type: Boolean,
  default: false
},
      quarantine_leave: {
        type: Number,
        default: 0
},
quarantine_leave_approval: {
  type: Boolean,
  default: false
},
quarantine_leave_forward: {
  type: Boolean,
  default: false
},
      sabbatical_leave: {
        type: Number,
        default: 0
},
sabbatical_leave_approval: {
  type: Boolean,
  default: false
},
sabbatical_leave_forward: {
  type: Boolean,
  default: false
},
      special_disability_leave: {
        type: Number,
        default: 0
},
special_disability_leave_approval: {
  type: Boolean,
  default: false
},
special_disability_leave_forward: {
  type: Boolean,
  default: false
},
      winter_vacation_leave: {
        type: Number,
        default: 0
},
winter_vacation_leave_approval: {
  type: Boolean,
  default: false
},
winter_vacation_leave_forward: {
  type: Boolean,
  default: false
},
      summer_vacation_leave: {
        type: Number,
        default: 0
},
summer_vacation_leave_approval: {
  type: Boolean,
  default: false
},
summer_vacation_leave_forward: {
  type: Boolean,
  default: false
},
      child_adoption_leave: {
        type: Number,
        default: 0
},
child_adoption_leave_approval: {
  type: Boolean,
  default: false
},
child_adoption_leave_forward: {
  type: Boolean,
  default: false
},
      bereavement_leave: {
        type: Number,
        default: 0
},
bereavement_leave_approval: {
  type: Boolean,
  default: false
},
bereavement_leave_forward: {
  type: Boolean,
  default: false
},
  },
    c_off_leave: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Leave",
        },
    ],
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstituteAdmin"
    },
    set_off_rules: {
        casual_leave: {type: Number, default: 0},
        sick_leave: {type: Number, default: 0},
        medical_leave: {type: Number, default: 0},
        commuted_leave: {type: Number, default: 0},
        maternity_leave: {type: Number, default: 0},
        paternity_leave: {type: Number, default: 0},
        study_leave: {type: Number, default: 0},
        half_pay_leave: {type: Number, default: 0},
        quarantine_leave: {type: Number, default: 0},
        sabbatical_leave: {type: Number, default: 0},
        special_disability_leave: {type: Number, default: 0},
        winter_vacation_leave: {type: Number, default: 0},
        summer_vacation_leave: {type: Number, default: 0},
        child_adoption_leave: {type: Number, default: 0},
        bereavement_leave: {type: Number, default: 0},
        earned_leave: {type: Number, default: 0},
    },
    leave_carry_forward: {
        type: Boolean,
        default: false
    },
    leave_start_academic_year: {
        type: Date
    },
    leave_end_academic_year: {
        type: Date
    },
    leave_pre_approved: {
        type: Boolean,
        default: false
  },
  leave_pre_approved_non_teaching: {
    type: Boolean,
    default: false
  },
  leave_carry_forward_non_teaching: {
    type: Boolean,
    default: false
},
    holiday_config: {
        dDate: [{ type: String }],
  },
  lms: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LMS"
},
})

module.exports = mongoose.model("LeaveConfig", leaveConfigSchema)