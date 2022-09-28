
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
      status: { type: String },
      createdAt: { type: Date, default: Date.now },
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
      status: { type: String },
      createdAt: { type: Date, default: Date.now },
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
      status: { type: String },
      createdAt: { type: Date, default: Date.now },
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
    default: 0
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
  financeRaisedBalance: {
    type: Number,
    default: 0
  },
  requestArray: [],
  staff_pay_list: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payroll'
    }
  ],
  salary_history: [
    {
      salary: { type: Number, default: 0},
      month: { type: String },
      pay_mode: { type: String },
      emp_pay: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payroll'
      }
    },
  ],
  payment_gateway_charges: [
    {
      original_amount: { type: Number, default: 0 },
      payment_mode: { type: String },
      percent: { type: String },
      deduct_charge_gateway_amount: { type: Number, default: 0 },
      return_amount: { type: Number, default: 0},
    },
  ]
  // ,
  // filter_finance: [
  //   {
  //     year: { type: String },
  //     data: [
  //       {
  //         month: { type: String },
  //         financeTotal: { type: Number, default: 0 },
  //         financeSubmit: { type: Number, default: 0 },
  //         financeCollected: { type: Number, default: 0 },
  //         financeBank: { type: Number, default: 0 },
  //         financeRaised: { type: Number, default: 0 },
  //         financeIncomeCash: { type: Number, default: 0 },
  //         financeExpenseCash: { type: Number, default: 0 },
  //         financeIncomeBank: { type: Number, default: 0 },
  //         financeExpenseBank: { type: Number, default: 0 },
  //         financeExempt: { type: Number, default: 0 },
  //       }
  //     ]
  //   }
  // ]
}, { timestamps: true});

const Finance = mongoose.model("Finance", financeSchema);

module.exports = Finance;

