const mongoose = require("mongoose")

const returnGoodsSchema = new mongoose.Schema({
    return_to_department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    return_to_hostel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hostel"
    },
    return_to_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class"
    },
    return_to_library: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library"
    },
    return_to_individual: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
    },
    return_to_custom: {
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
    return_flow: {
        type: String
    },
})

module.exports = mongoose.model("ReturnGoods", returnGoodsSchema)