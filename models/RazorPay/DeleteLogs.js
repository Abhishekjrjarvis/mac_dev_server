const mongoose = require("mongoose")

const deleteLogsSchema = new mongoose.Schema({
    fee_receipt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt"
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    nested_card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NestedCard"
    }
})

module.exports = mongoose.model("DeleteLogs", deleteLogsSchema)