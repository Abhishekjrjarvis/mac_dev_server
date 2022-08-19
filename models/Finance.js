
const mongoose = require("mongoose");

const financeSchema = new mongoose.Schema({ 
  financeHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
    required: true,
  },
  financeName: { type: String },
  financePhoneNumber: { type: Number },
  financeEmail: { type: String },
  financeAbout: { type: String },
  photoId: { type: String, default: "1" },
  photo: { type: String },
  coverId: { type: String, default: "2" },
  cover: { type: String },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  incomeDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Income",
    },
  ],
  expenseDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
    },
  ],
  classRoom: [
    {
      classId: { type: String },
      className: { type: String },
      photoId: { type: String },
      photo: { type: String },
      staff: { type: String },
      feeId: { type: String },
      feeName: { type: String },
      feeAmount: { type: Number },
      status: { type: String }
    },
  ],
  submitClassRoom: [
    {
      classId: { type: String },
      className: { type: String },
      photoId: { type: String },
      photo: { type: String },
      staff: { type: String },
      feeId: { type: String },
      feeName: { type: String },
      feeAmount: { type: Number },
      status: { type: String }
    },
  ],
  pendingClassroom: [
    {
      classId: { type: String },
      className: { type: String },
      photoId: { type: String },
      photo: { type: String },
      staff: { type: String },
      feeId: { type: String },
      feeName: { type: String },
      feeAmount: { type: Number },
      status: { type: String }
    },
  ],
  financeProfilePhoto: {
    type: String,
  },
  financeCoverPhoto: {
    type: String,
  },
  financeBankBalance: {
    type: Number,
    default: 0,
  },
  financeCashBalance: {
    type: Number,
    default: 0,
  },
  financeSubmitBalance: {
    type: Number,
    default: 0,
  },
  financeTotalBalance: {
    type: Number,
  },
  financeEContentBalance: {
        type: Number,
        default: 0
  },
  financeApplicationBalance: {
    type: Number,
    default: 0
  },
  financeAdmissionBalance: {
    type: Number, 
    default: 0
  },
  financeIncomeCashBalance: {
    type: Number,
    default: 0
  },
  financeIncomeBankBalance: {
    type: Number,
    default: 0
  },
  financeExpenseCashBalance: {
    type: Number,
    default: 0
  },
  financeExpenseBankBalance: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  financeCollectedSBalance: {
    type: Number,
    default: 0
  },
  financeExemptBalance: {
    type: Number,
    default: 0
  },
  requestArray: []
}, { timestamps: true});

const Finance = mongoose.model("Finance", financeSchema);

module.exports = Finance;

