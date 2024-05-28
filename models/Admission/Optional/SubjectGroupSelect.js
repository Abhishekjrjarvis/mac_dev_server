const mongoose = require("mongoose")

const subjectGroupSelectSchema = new mongoose.Schema({
    group_name: {
        type: String
    },
    compulsory_subject: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubjectMaster"
        }
    ],
    optional_subject: [
        {
            optional_subject_rule: {
                type: Number,
                default: 1
            },
            optional_subject_rule_max: {
                type: Number,
                default: 1
            },
            optional_subject_name: {
                type: String
            },
            optional_subject_options: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "SubjectMaster"
                }
            ],
            optional_subject_options_or: [
                {
                    options: [
                        {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: "SubjectMaster"
                        }
                    ]
                }
            ],
        }
    ],
    fixed_subject: [
        {
            fixed_subject_rule: {
                type: Number,
                default: 1
            },
            fixed_subject_rule_max: {
                type: Number,
                default: 1
            },
            fixed_subject_name: {
                type: String
            },
            fixed_subject_options: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "SubjectMaster"
                }
            ],
        }
    ],
    compulsory_subject_count: {
        type: Number,
        default: 0
    },
    optional_subject_count: {
        type: Number,
        default: 0
    },
    fixed_subject_count: {
        type: Number,
        default: 0
    },
    subject_group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubjectGroup"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("SubjectGroupSelect", subjectGroupSelectSchema)