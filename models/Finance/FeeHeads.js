const mongoose = require("mongoose")

const feeHeadsSchema = new mongoose.Schema({
    appId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication"
    },
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
    },
    head_name: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    applicable_fee: {
        type: Number,
        default: 0
    },
    remain_fee: {
        type: Number,
        default: 0
    },
    paid_fee: {
        type: Number,
        default: 0
    },
    fee_structure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeStructure",
    },
    master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
    },
    original_paid: {
        type: Number,
        default: 0
    },
    head_type: {
        type: String
    }
})

module.exports = mongoose.model("FeeHeads", feeHeadsSchema)