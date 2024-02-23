const mongoose = require("mongoose");

const feeCategorySchema = new mongoose.Schema({
  category_name: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  finance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Finance",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  document_update: {
    type: Boolean,
    default: false,
  },
  current_status: {
    type: String,
    default: "Primary Category",
  },
  secondary_category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeCategory",
  },
  scholarship_applicable: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("FeeCategory", feeCategorySchema);
