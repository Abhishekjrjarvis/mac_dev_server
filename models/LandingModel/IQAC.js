const mongoose = require("mongoose")

const iqacSchema = new mongoose.Schema({
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstituteAdmin"
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    authority: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CustomAuthority"
        }
    ],
    authority_count: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model("IQAC", iqacSchema)