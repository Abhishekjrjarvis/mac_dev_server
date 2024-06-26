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
          },
          set_off: {
            type: Number,
            default: 0
          },
          set_off_message: {
            type: String
          },
          fee_update: {
            type: Boolean,
            default: false
          },
          gov_stats: {
            type: String
          },
          fee_heads: [
            {
              head_id: { type: String },
              head_name: { type: String },
              paid_fee: { type: Number, default: 0 },
              applicable_fee: { type: Number, default: 0 },
              remain_fee: { type: Number, default: 0 },
              created_at: { type: Date, default: Date.now },
              fee_structure: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "FeeStructure",
              },
              master: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "FeeMaster",
              },
              original_paid: { type: Number, default: 0 },
              appId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "NewApplication",
              },
              is_society: {
                type: Boolean,
                default: false
              },
            },
          ],
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
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  fee_update: {
    type: Boolean,
    default: false
  },
})

module.exports = mongoose.model("NestedCard", nestedCardSchema)