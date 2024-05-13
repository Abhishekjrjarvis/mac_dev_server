const mongoose = require("mongoose")

const subjectGroupSelectSchema = new mongoose.Schema({
    group_name: {
        type: String
    },
    compulsory_subject: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject"
        }
    ],
    optional_subject: [
        {
            optional_subject_rule: {
                type: Number,
                default: 1
            },
            optional_subject_name: {
                type: String
            },
            optional_subject_options: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Subject"
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