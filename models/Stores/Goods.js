const mongoose = require("mongoose");

const inventoryStoreSchema = new mongoose.Schema({
    goods_name: {
      type: String,
    },
    goods_quantity: {
      type: String,
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    good_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GoodCategory"
    },
    request: [],
    issue: [],
    return: [],
    consume: [],
    stock_take: [],
    register: [],
    maintanence: []
});

module.exports = mongoose.model("Goods", inventoryStoreSchema);

