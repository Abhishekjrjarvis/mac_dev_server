const mongoose = require("mongoose")

const qvipleIdSchema = new mongoose.Schema({
    qviple_id: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstituteAdmin"
    }
})

module.exports = mongoose.model("QvipleId", qvipleIdSchema)