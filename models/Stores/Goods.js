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
    goods_icon: {
        type: String
    },
    good_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GoodCategory"
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
    maintanence: [],
    goods_volume: {
        type: Number,
        default: 0
    },
    goods_price: {
        type: Number,
        default: 0
    },
    goods_qr_code: {
        type: String
    }
});

module.exports = mongoose.model("Goods", inventoryStoreSchema);

