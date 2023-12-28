const mongoose = require("mongoose")

const flowLogSchema = new mongoose.Schema({
    logs_comes: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    is_apk: {
        type: Boolean,
        default: false
    },
    is_web: {
        type: Boolean,
        default: false
    },
    logs_reason: {
        type: String
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    },
    remaining_list: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RemainingList"
    }
})

module.exports = mongoose.model("FlowLog", flowLogSchema)