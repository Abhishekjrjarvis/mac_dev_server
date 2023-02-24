const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  expenseAccount: {
    type: String,
    required: true,
  },
  expensePurpose: {
    type: String,
  },
  expenseAmount: {
    type: Number,
    required: true,
  },
  expensePaid: {
    type: String,
  },
  expensePaidUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  expenseDesc: {
    type: String,
  },
  expenseAck: {
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expense_quantity: {
    type: Number,
    default: 0,
  },
  expense_good_name: {
    type: String,
  },
  expense_hsn_code: {
    type: String,
  },
  invoice_number: { type: Number, default: 0 },
});

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
