const mongoose = require("mongoose");

const financeSchema = new mongoose.Schema(
  {
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
      default: 0,
    },
    financeEContentBalance: {
      type: Number,
      default: 0,
    },
    financeApplicationBalance: {
      type: Number,
      default: 0,
    },
    financeAdmissionBalance: {
      type: Number,
      default: 0,
    },
    financeIncomeCashBalance: {
      type: Number,
      default: 0,
    },
    financeIncomeBankBalance: {
      type: Number,
      default: 0,
    },
    financeExpenseCashBalance: {
      type: Number,
      default: 0,
    },
    financeExpenseBankBalance: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    financeCollectedSBalance: {
      type: Number,
      default: 0,
    },
    financeCollectedBankBalance: {
      type: Number,
      default: 0,
    },
    financeExemptBalance: {
      type: Number,
      default: 0,
    },
    financeRaisedBalance: {
      type: Number,
      default: 0,
    },
    financeParticipateEventBalance: {
      type: Number,
      default: 0,
    },
    requestArray: [],
    staff_pay_list: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payroll",
      },
    ],
    salary_history: [
      {
        salary: { type: Number, default: 0 },
        month: { type: String },
        pay_mode: { type: String },
        emp_pay: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Payroll",
        },
      },
    ],
    payment_gateway_charges: [
      {
        original_amount: { type: Number, default: 0 },
        payment_mode: { type: String },
        percent: { type: String },
        deduct_charge_gateway_amount: { type: Number, default: 0 },
        return_amount: { type: Number, default: 0 },
      },
    ],
    export_student_data: {
      fullName: { type: Boolean, default: true },
      studentAddress: { type: Boolean, default: true },
      studentPhoneNumber: { type: Boolean, default: true },
      studentRemainingFeeCount: { type: Boolean, default: true },
      studentPaidFeeCount: { type: Boolean, default: true },
      studentGRNO: { type: Boolean, default: true },
      studentDepartment: { type: Boolean, default: true },
      studentClass: { type: Boolean, default: true },
    },
    gst_format: {
      liability: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Income",
        },
      ],
      input_tax_credit: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Expense",
        },
      ],
      b_to_c: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "BusinessTC",
        },
      ],
    },
    transport_request: [
      {
        transport_module: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Transport",
        },
        createdAt: { type: Date, default: Date.now },
        amount: { type: Number, default: 0 },
        status: { type: String },
      },
    ],
    transport_submit: [
      {
        transport_module: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Transport",
        },
        createdAt: { type: Date, default: Date.now },
        amount: { type: Number, default: 0 },
        status: { type: String },
      },
    ],
    transport_cancelled: [
      {
        transport_module: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Transport",
        },
        createdAt: { type: Date, default: Date.now },
        amount: { type: Number, default: 0 },
        status: { type: String },
      },
    ],
    finance_inventory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
      },
    ],
    finance_inventory_count: {
      type: Number,
      default: 0,
    },
    admission_request: [
      {
        admission: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Admission",
        },
        createdAt: { type: Date, default: Date.now },
        amount: { type: Number, default: 0 },
        status: { type: String },
      },
    ],
    admission_submit: [
      {
        admission: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Admission",
        },
        createdAt: { type: Date, default: Date.now },
        amount: { type: Number, default: 0 },
        status: { type: String },
      },
    ],
    admission_cancelled: [
      {
        admission: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Admission",
        },
        createdAt: { type: Date, default: Date.now },
        amount: { type: Number, default: 0 },
        status: { type: String },
      },
    ],
    library_request: [
      {
        library: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Library",
        },
        createdAt: { type: Date, default: Date.now },
        amount: { type: Number, default: 0 },
        status: { type: String },
      },
    ],
    library_submit: [
      {
        library: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Library",
        },
        createdAt: { type: Date, default: Date.now },
        amount: { type: Number, default: 0 },
        status: { type: String },
      },
    ],
    library_cancelled: [
      {
        library: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Library",
        },
        createdAt: { type: Date, default: Date.now },
        amount: { type: Number, default: 0 },
        status: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Finance = mongoose.model("Finance", financeSchema);

module.exports = Finance;
