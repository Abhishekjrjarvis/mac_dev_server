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
  photoId: {
    type: String,
  },
  vehicle_photo: {
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
  vehicle_no_driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  vehicle_no_conductor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  vehicle_route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Direction",
  },
  route_count: {
    type: Number,
    default: 0,
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
  passenger_array_with_batch: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransportBatch",
    },
  ],
  collectedFeeCount: {
    type: Number,
    default: 0,
  },
  offlineFee: {
    type: Number,
    default: 0,
  },
  onlineFee: {
    type: Number,
    default: 0,
  },
  exemptFee: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
