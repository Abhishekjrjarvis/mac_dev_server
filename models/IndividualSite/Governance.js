const mongoose = require("mongoose")

const governanceSchema = new mongoose.Schema({
    governance_head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstituteAdmin",
    },
    tab_manage: {
        iqac: {
          type: Boolean,
          default: true
        },
        college_dev_committee: {
          type: Boolean,
          default: true
        },
        academic_monit_committee: {
          type: Boolean,
          default: true
        },
        academic_research_committee: {
          type: Boolean,
          default: true
        },
        anti_ragging_committee: {
          type: Boolean,
          default: true
        },
        anti_ragging_squad: {
          type: Boolean,
          default: true
        },
        college_examination_committee: {
          type: Boolean,
          default: true
        },
        grievance_redressal_committee: {
          type: Boolean,
          default: true
        },
        internal_complaint_committee: {
          type: Boolean,
          default: true
        },
        women_redressal_cell: {
          type: Boolean,
          default: true
        },
        student_council: {
          type: Boolean,
          default: true
        },
        lmc: {
          type: Boolean,
          default: true
        },
        institute_innovation_cell: {
          type: Boolean,
          default: true
        },
        minority_committee: {
            type: Boolean,
            default: true
        },
        disater_management_committee: {
            type: Boolean,
            default: true
        },
        earn_lean_scheme: {
            type: Boolean,
            default: true
        },
        food_governing_committee: {
            type: Boolean,
            default: true
        },
        nodal_committee: {
            type: Boolean,
            default: true
        },
        building_garden_committee: {
            type: Boolean,
            default: true
        },
        enterpreneurship_dev_committee: {
            type: Boolean,
            default: true
        },
        gender_equality_cell: {
            type: Boolean,
            default: true
        },
        code_conduct_monit_cell: {
            type: Boolean,
            default: true
        },
        code_conduct: {
            type: Boolean,
            default: true
        },
        service_rules_regulation: {
            type: Boolean,
            default: true
        },
        equal_opportunity_centre: {
            type: Boolean,
            default: true
        },
        pso: {
            type: Boolean,
            default: true
        },
    },
    
})

module.exports = mongoose.model("Governance", governanceSchema)