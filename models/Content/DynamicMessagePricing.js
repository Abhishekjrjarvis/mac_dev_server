const mongoose = require("mongoose");

const dynamicMessagePricingSchema = new mongoose.Schema(
  {
    total_message: {
      type: Number,
      default: 5000,
    },
    message_type: {
      type: String,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "DynamicMessagePricing",
  dynamicMessagePricingSchema
);
