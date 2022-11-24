const mongoose = require("mongoose");

const busiToCustSchema = new mongoose.Schema({
  b_to_c_month: { type: Date },
  b_to_c_name: { type: String, default: "Internal Fees" },
  b_to_c_total_amount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  b_to_c_i_slab: { type: Number, default: 9 },
  b_to_c_s_slab: { type: Number, default: 9 },
  finance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Finance",
  },
});

module.exports = mongoose.model("BusinessTC", busiToCustSchema);
