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
  remainingFee: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
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
  bank_account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankAccount",
  },
  transport_passengers_with_batch: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransportBatch",
    },
  ],
  fees_structures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStructure",
    },
  ],
  fees_structures_count: {
    type: Number,
    default: 0,
  },
  modify_fees_structures_count: {
    type: Number,
    default: 0,
  },
  refund_deposit: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeReceipt",
    },
  ],
  batches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
  ],
  departmentSelectBatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  batchCount: {
    type: Number,
    default: 0,
  },
  masters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
  ],
  masterCount: {
    type: Number,
    default: 0,
  },
  moderator_role: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionModerator",
    },
  ],
  moderator_role_count: {
    type: Number,
    default: 0,
  },
  site_info: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransportSite",
    },
  ],
  refundFeeList: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      refund: { type: Number, default: 0 },
    },
  ],
  refundCount: {
    type: Number,
    default: 0,
  },
  refundedFeeList: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      refund: { type: Number, default: 0 },
      fee_receipt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt",
      },
    },
  ],
  refundedCount: {
    type: Number,
    default: 0,
  },
  pending_student: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  linked_institute: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  linked_institute_count: {
    type: Number,
    default: 0,
  },
  // member_module_unique: {
  //   type: String,
  //   unique: true
  // }
});

module.exports = mongoose.model("Transport", transportSchema);
