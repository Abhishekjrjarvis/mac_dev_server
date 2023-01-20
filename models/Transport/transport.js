const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema({
  transport_manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  vehicle_count: {
    type: Number,
    default: 0,
  },
  transport_staff_count: {
    type: Number,
    default: 0,
  },
  passenger_count: {
    type: Number,
    default: 0,
  },
  online_fee: {
    type: Number,
    default: 0,
  },
  offline_fee: {
    type: Number,
    default: 0,
  },
  exempt_fee: {
    type: Number,
    default: 0,
  },
  remaining_fee: {
    type: Number,
    default: 0,
  },
  transport_photo: {
    type: String,
  },
  photoId: {
    type: String,
  },
  transport_drivers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  transport_conductors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  transport_passengers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  transport_vehicles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
  ],
  transport_ndconductors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  requested_status: {
    type: String,
    default: "Pending",
  },
  collected_fee: {
    type: Number,
    default: 0,
  },
  fund_history: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      is_install: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      amount: { type: Number, default: 0 },
      mode: { type: String },
    },
  ],
});

module.exports = mongoose.model("Transport", transportSchema);
