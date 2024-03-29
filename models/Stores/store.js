const mongoose = require("mongoose");

const inventoryStoreSchema = new mongoose.Schema({
    store_head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
    created_at: {
        type: Date,
        default: Date.now
  },
  good_category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GoodCategory"
      }
  ],
  good_category_count: {
    type: Number,
    default: 0
  },
  tab_manage: {
    store_unit: {
      type: Boolean,
      default: true
    },
    individual_staff: {
      type: Boolean,
      default: true
    },
    issue_register: {
      type: Boolean,
      default: true
    },
    return_register: {
      type: Boolean,
      default: true
    },
    stock: {
      type: Boolean,
      default: true
    },
    purchase_order: {
      type: Boolean,
      default: true
    },
    stock_take: {
      type: Boolean,
      default: true
    },
    qr_codes: {
      type: Boolean,
      default: true
    },
    consumption: {
      type: Boolean,
      default: true
    },
    maintanence: {
      type: Boolean,
      default: true
    },
    brokrages: {
      type: Boolean,
      default: true
    },
    data_export: {
      type: Boolean,
      default: true
    },
  },
  good_heads: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GoodManager"
    }
  ],
  good_heads_count: {
    type: Number,
    default: 0
  }
  
});

module.exports = mongoose.model("InventoryStore", inventoryStoreSchema);

