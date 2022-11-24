const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema({
  incomeAccount: {
    type: String,
    required: true,
  },
  incomePurpose: {
    type: String,
  },
  incomeAmount: {
    type: Number,
    required: true,
  },
  incomeFrom: {
    type: String,
  },
  incomeFromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  incomeDesc: {
    type: String,
    required: true,
  },
  incomeAck: {
    type: String,
  },
  finances: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Finance",
  },
  gstSlab: { type: Number, default: 0 },
  gst_number: { type: String },
  business_name: { type: String },
  business_address: { type: String },
  invoice_number: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Income = mongoose.model("Income", incomeSchema);

module.exports = Income;
