const mongoose = require("mongoose");

const transportBatch = new mongoose.Schema({
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  transport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transport",
  },
  direction: { type: mongoose.Schema.Types.ObjectId, ref: "Direction" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("TransportBatch", transportBatch);
