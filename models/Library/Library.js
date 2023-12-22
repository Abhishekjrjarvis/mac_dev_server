const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema({
  libraryHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    // required: true,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  coverId: { type: String },
  cover: { type: String },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  issued: [{ type: mongoose.Schema.Types.ObjectId, ref: "IssueBook" }],
  collected: [{ type: mongoose.Schema.Types.ObjectId, ref: "CollectBook" }],
  bookCount: {
    type: Number,
    default: 0,
  },
  memberCount: {
    type: Number,
    default: 0,
  },
  totalFine: {
    type: Number,
    default: 0,
  },
  offlineFine: {
    type: Number,
    default: 0,
  },
  onlineFine: {
    type: Number,
    default: 0,
  },
  collectedFine: {
    type: Number,
    default: 0,
  },
  requestStatus: {
    type: String,
    default: "Pending",
  },
  exemptFine: {
    type: Number,
    default: 0,
  },
  charge_history: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CollectBook",
    },
  ],
  createdAt: { type: Date, default: Date.now },
  site_info: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LibrarySite",
    },
  ],
  bank_account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankAccount",
  },
  pending_fee: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
      created_at: {
        type: Date,
        default: Date.now,
      },
      fee_receipt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt",
      },
      fine_charge: {
        type: Number,
        default: 0,
      },
      fine_type: {
        type: String,
      },
      status: {
        type: String,
        default: "Not Paid",
      },
    },
  ],
  paid_fee: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
      created_at: {
        type: Date,
        default: Date.now,
      },
      fee_receipt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt",
      },
      fine_charge: {
        type: Number,
        default: 0,
      },
      fine_type: {
        type: String,
      },
      status: {
        type: String,
        default: "Not Paid",
      },
    },
  ],
  remainFine: {
    type: Number,
    default: 0,
  },
  member_module_unique: {
    type: String,
    unique: true
  },
  export_collection: [
    {
      excel_type: {
        type: String,
        enum: [
          "LIBRARY_BOOK",
          "LIBRARY_ISSUE",
          "LIBRARY_COLLECT",
          "LIBRARY_MEMBER",
          "LIBRARY_FINE_OUTSTANDING",
          "LIBRARY_FINE_RECEIVE",
        ],
      },
      excel_file: { type: String },
      excel_file_name: { type: String },
      created_at: { type: Date, default: Date.now },
    },
  ],
  export_collection_count: {
    type: Number,
    default: 0,
  },
  staff_members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Staff" }],
  staff_members_count: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Library", librarySchema);
