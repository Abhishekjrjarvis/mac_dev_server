const mongoose = require("mongoose")

const issueGoodsSchema = new mongoose.Schema({
    issue_to_department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    issue_to_hostel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hostel"
    },
    issue_to_class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class"
    },
    issue_to_library: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library"
    },
    issue_to_individual: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
    },
    issue_to_custom: {
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
    issue_flow: {
        type: String
    },
})

module.exports = mongoose.model("IssueGoods", issueGoodsSchema)