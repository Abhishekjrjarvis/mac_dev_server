const mongoose = require("mongoose");

const goodManagerSchema = new mongoose.Schema({
    good_head_name: {
      type: String,
    },
    good_title_person: {
      type: String,
    },
    good_head_person: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    store: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InventoryStore"
    },
    request: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RequestGoods"
          }
    ],
    issue: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "IssueGoods"
        }
    ],
    return: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ReturnGoods"
          }
    ],
    consume: [],
    stock_take: [],
    register: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StoreLogs"
        }
    ],
    maintanence: []
});

module.exports = mongoose.model("GoodManager", goodManagerSchema);

