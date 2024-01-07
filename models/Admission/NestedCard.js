const mongoose = require("mongoose")

const nestedCardSchema = new mongoose.Schema({
    paid_fee: {
        type: Number,
        default: 0
    },
    remaining_fee: {
        type: Number,
        default: 0
    },
    applicable_fee: {
        type: Number,
        default: 0
  },
  refund_fee: {
    type: Number,
    default: 0
  },
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
        }
        },
      ],
    parent_card: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RemainingList"
    },
    access_mode_card: {
        type: String,
      },
      active_payment_type: {
        type: String,
        default: "No Process",
      },
      status: {
        type: String,
        default: "Not Paid"
      },
      excess_fee: {
        type: Number,
        default: 0
      }
})

module.exports = mongoose.model("NestedCard", nestedCardSchema)