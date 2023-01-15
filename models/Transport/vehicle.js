const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
  vehicle_type: {
    type: String,
    required: true,
  },
  vehicle_number: {
    type: String,
    required: true,
  },
  vehicle_tracking_id: {
    type: String,
  },
  vehicle_driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  vehicle_conductor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  vehicle_route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Direction",
  },
  passenger_count: {
    type: Number,
    default: 0,
  },
  passenger_array: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  remaining_fee: {
    type: Number,
    default: 0,
  },
  transport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transport",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
