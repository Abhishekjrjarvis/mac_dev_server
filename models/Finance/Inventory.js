const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  goods_name: { type: String },
  goods_quantity: { type: Number, default: 0 },
  total_expenses: { type: Number, default: 0 },
  hsn_code: { type: String },
  goods_amount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  depreciation_rate: { type: String },
  depreciation_method: { type: String },
  expense_array: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
    },
  ],
});

module.exports = mongoose.model("Store", storeSchema);
