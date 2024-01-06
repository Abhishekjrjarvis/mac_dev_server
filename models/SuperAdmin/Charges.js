const mongoose = require("mongoose")

const chargesSchema = new mongoose.Schema({
    platform_charges: {
        type: Number,
        default: 0
    },
    transaction_charges: {
        type: Number,
        default: 0
    },
    application_charges: {
        type: Number,
        default: 0
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstituteAdmin"
    }
})

module.exports = mongoose.model("Charges", chargesSchema)