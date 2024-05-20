const mongoose = require("mongoose")

const activitySchema = new mongoose.Schema({
    activity_name: {
        type: String
    },
    activity_department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    activity_staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    activity_type: {
        type: String
    },
    notice: [],
    permission_letter: [],
    activity_report: [],
    attendance: [],
    other: [
        {
            name: { type: String },
            attach: { type: String }
        }
    ]
})

module.exports = mongoose.model("Activity", activitySchema)