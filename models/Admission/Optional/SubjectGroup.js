const mongoose = require("mongoose")

const subjectGroupSchema = new mongoose.Schema({
    subject_group_name: {
        type: String
    },
    no_of_group: {
        type: Number,
        default: 1
    },
    admission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admission"
    },
    subject_group_select: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubjectGroupSelect"
        }
    ],
    created_at: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("SubjectGroup", subjectGroupSchema)