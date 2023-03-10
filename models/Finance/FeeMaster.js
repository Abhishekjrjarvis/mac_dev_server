const mongoose = require("mongoose");

const feeMasterSchema = new mongoose.Schema({
  master_name: {
    type: String,
    required: true,
  },
  master_amount: {
    type: Number,
    required: true,
    default: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  finance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Finance",
  },
  document_update: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("FeeMaster", feeMasterSchema);
