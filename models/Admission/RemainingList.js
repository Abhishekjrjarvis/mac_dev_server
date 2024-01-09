const mongoose = require("mongoose");

const remainingFeeListSchema = new mongoose.Schema({
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NewApplication",
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  applicable_fee: { type: Number, default: 0 },
  remaining_fee: { type: Number, default: 0 },
  exempted_fee: { type: Number, default: 0 },
  paid_fee: { type: Number, default: 0 },
  refund_fee: { type: Number, default: 0 },
  applicable_card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NestedCard"
  },
  government_card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NestedCard"
  },
  fee_receipts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeReceipt",
    },
  ],
  remaining_array: [
    {
      appId: { type: mongoose.Schema.Types.ObjectId, ref: "NewApplication" },
      vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
      },
      remainAmount: { type: Number, default: 0 },
      status: { type: String, default: "Not Paid" },
      instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstituteAdmin",
      },
      installmentValue: { type: String },
      isEnable: { type: Boolean, default: false },
      mode: { type: String },
      originalFee: { type: Number, default: 0 },
      dueDate: { type: String },
      exempt_status: { type: String, default: "Not Exempted" },
      fee_receipt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt",
      },
      refund_status: { type: String, default: "Not Refunded" },
      reject_reason: { type: String },
      receipt_status: {
        type: String
      },
      reason: {
        type: String
    },
    revert_status: {
        type: String
    },
    component: {
      app: {
        type: Number,
        default: 0
      },
      gov: {
        type: Number,
        default: 0
      }
    },
    cover_status: {
      type: String
    },
    set_off: {
      type: Number,
      default: 0
    }
    },
  ],
  status: { type: String, default: "Not Paid" },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  fee_structure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeStructure",
  },
  remark: {
    type: String,
  },
  remaining_flow: {
    type: String,
    default: "Admission Application",
  },
  renewal_start: {
    type: Date,
  },
  renewal_end: {
    type: Date,
  },
  paid_by_student: {
    type: Number,
    default: 0,
  },
  paid_by_government: {
    type: Number,
    default: 0,
  },
  access_mode_card: {
    type: String,
  },
  set_off: {
    type: Number,
    default: 0,
  },
  setOffPrice: {
    type: Number,
    default: 0,
  },
  card_type: {
    type: String,
    default: "Normal",
  },
  scholar_ship_number: {
    type: String,
  },
  active_payment_type: {
    type: String,
    default: "No Process",
  },
  drop_status: {
    type: String,
    default: "Disable",
  },
  already_made: {
    type: Boolean,
    default: false,
  },
  button_status: {
    type: String,
    default: "Collect Fees",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  re_admission_flow: {
    type: Boolean,
    default: false,
  },
  re_admission_class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  applicable_fees_pending: {
    type: Number,
    default: 0,
  },
  excess_fee: { type: Number, default: 0 },
});

module.exports = mongoose.model("RemainingList", remainingFeeListSchema);
