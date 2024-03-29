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
    request: [],
    issue: [],
    return: [],
    consume: [],
    stock_take: [],
    register: [],
    maintanence: []
});

module.exports = mongoose.model("GoodManager", goodManagerSchema);

