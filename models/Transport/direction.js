const mongoose = require("mongoose");

const directionSchema = new mongoose.Schema({
  direction_route: [
    {
      route_stop: { type: String },
      route_fees: { type: Number, default: 0 },
    },
  ],
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Direction", directionSchema);
