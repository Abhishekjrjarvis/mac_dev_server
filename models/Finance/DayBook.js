const mongoose = require("mongoose")

const dayBookSchema = new mongoose.Schema({
    db_file: {
        type: String
    },
    db_status: {
        type: String,
        default: "Not Generated"
    },
    db_created: {
        type: Date,
        default: Date.now
    },
    finance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Finance"
    },
    db_file_date: {
        type: String
    },
    db_file_type: {
        type: String
    },
    db_amount: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model("DayBook", dayBookSchema)