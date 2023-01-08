const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema({
  content: { type: String, required: true },
  status: { type: String },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NewApplication",
  },
  payMode: { type: String },
  isPaid: { type: String, default: "Not Paid" },
  for_selection: { type: String },
  studentId: { type: String },
  admissionFee: { type: Number },
  see_secure: { type: Boolean, default: false },
  oneInstallments: { type: Number },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Status", statusSchema);
