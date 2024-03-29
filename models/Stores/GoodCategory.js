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
    }
});

module.exports = mongoose.model("GoodCategory", goodCategorySchema);

