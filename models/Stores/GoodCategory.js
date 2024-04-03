const mongoose = require("mongoose");

const goodCategorySchema = new mongoose.Schema({
    category_name: {
      type: String,
    },
    category_type: {
        type: String,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryStore",
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    goods_arr: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Goods"
        }
    ],
    goods_arr_count: {
        type: Number,
        default: 0
    },
    request: [],
    issue: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StoreLogs"
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

module.exports = mongoose.model("GoodCategory", goodCategorySchema);

