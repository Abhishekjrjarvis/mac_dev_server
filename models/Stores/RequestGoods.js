const mongoose = require("mongoose")

const requestGoodsSchema = new mongoose.Schema({
    request_by_department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    request_by_hostel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hostel"
    },
    request_by_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class"
    },
    request_by_library: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library"
    },
    request_by_individual: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
    },
    request_by_custom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GoodManager"
    },
    goods: [
        {
            good: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Goods"
            },
            quantity: {
                type: Number,
                default: 0
            }
        }
    ],
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InventoryStore"
    },
    request_flow: {
        type: String
    },
    status: {
        type: String,
        default: "Requested"
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("RequestGoods", requestGoodsSchema)