const mongoose = require("mongoose");

const tenderSchema = new mongoose.Schema({
  tender_requirement: {
    type: String,
    required: true,
  },
  tender_status: {
    type: String,
    default: "Open",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  tender_budget: {
    type: Number,
    default: 0,
  },
  tender_about: {
    type: String,
  },
  tender_order: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  landing_tender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LandingTender",
  },
  bid_count: {
    type: Number,
    default: 0,
  },
  bid: [
    {
      bidder_name: { type: String },
      bidder_email: { type: String },
      bidder_phone_number: { type: String },
      bidder_address: { type: String },
      bidder_quotation: { type: String },
      offer_price: { type: Number, default: 0 },
      order_detail: { type: String },
      purchase_order: { type: String },
    },
  ],
});

module.exports = mongoose.model("Tender", tenderSchema);
