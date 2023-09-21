const mongoose = require("mongoose");

const directionSchema = new mongoose.Schema({
  direction_route: [
    {
      route_stop: { type: String },
      route_fees: { type: Number, default: 0 },
      route_structure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeStructure",
      },
      passenger_list: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
      ],
      passenger_count: { type: Number, default: 0 },
      passenger_list_with_batch: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "TransportBatch",
        },
      ],
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
