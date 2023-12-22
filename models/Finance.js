const mongoose = require("mongoose");

const financeSchema = new mongoose.Schema(
  {
    financeHead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      // required: true,
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
    financeTransportBalance: {
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
    financeHostelBalance: {
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
    financeGovernmentScholarBalance: {
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
        month: { type: Date },
        pay_mode: { type: String },
        emp_pay: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Payroll",
        },
      },
    ],
    payroll_master: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PayrollMaster",
      },
    ],
    payroll_master_count: {
      type: Number,
      default: 0,
    },
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
    bank_account: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BankAccount",
      },
    ],
    bank_account_count: {
      type: Number,
      default: 0,
    },
    fees_category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeCategory",
      },
    ],
    fees_category_count: {
      type: Number,
      default: 0,
    },
    modify_fees_category_count: {
      type: Number,
      default: 0,
    },
    fee_master_array: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
    ],
    fee_master_array_count: {
      type: Number,
      default: 0,
    },
    exempt_receipt: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt",
      },
    ],
    exempt_receipt_count: {
      type: Number,
      default: 0,
    },
    government_receipt: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt",
      },
    ],
    government_receipt_count: {
      type: Number,
      default: 0,
    },
    payment_modes_type: {
      cash: { type: Boolean, default: true },
      upi_transfer: { type: Boolean, default: true },
      net_banking: { type: Boolean, default: true },
      cheque: { type: Boolean, default: true },
      demand_draft: { type: Boolean, default: true },
    },
    designation_password: {
      type: String,
    },
    designation_status: {
      type: String,
      default: "Locked",
    },
    enable_protection: { type: Boolean, default: true },
    moderator_role: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FinanceModerator",
      },
    ],
    moderator_role_count: {
      type: Number,
      default: 0,
    },
    export_collection: [
      {
        excel_file: { type: String },
        excel_file_name: { type: String },
        created_at: { type: Date, default: Date.now },
      },
    ],
    export_collection_count: {
      type: Number,
      default: 0,
    },
    deposit_linked_head: {
      master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      status: { type: String, default: "Not Linked" },
    },
    deposit_hostel_linked_head: {
      master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      status: { type: String, default: "Not Linked" },
    },
    deposit_transport_linked_head: {
      master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      status: { type: String, default: "Not Linked" },
    },
    refund_deposit: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt",
      },
    ],
    hostel_request: [
      {
        hostel: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Hostel",
        },
        createdAt: { type: Date, default: Date.now },
        amount: { type: Number, default: 0 },
        status: { type: String },
      },
    ],
    hostel_submit: [
      {
        hostel: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Hostel",
        },
        createdAt: { type: Date, default: Date.now },
        amount: { type: Number, default: 0 },
        status: { type: String },
      },
    ],
    hostel_cancelled: [
      {
        hostel: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Hostel",
        },
        createdAt: { type: Date, default: Date.now },
        amount: { type: Number, default: 0 },
        status: { type: String },
      },
    ],
    secondary_category: {
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeCategory",
      },
      status: { type: String, default: "Not Assigned" },
    },
    pending_all_student_fee_custom_filter: {
      gender: {
        type: String,
      },
      cast_category: {
        type: String,
      },
      department: [],
      batch: [],
      master: [],
    },
    fees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fees"
      }
    ],
    fees_count: {
      type: Number,
      default: 0
    },
    tab_manage: {
      all_students: {
        type: Boolean,
        default: true
      },
      bank_details: {
        type: Boolean,
        default: true
      },
      pending_fees: {
        type: Boolean,
        default: true
      },
      incomes: {
        type: Boolean,
        default: true
      },
      expenses: {
        type: Boolean,
        default: true
      },
      submit_request: {
        type: Boolean,
        default: true
      },
      scholarships: {
        type: Boolean,
        default: true
      },
      exemption: {
        type: Boolean,
        default: true
      },
      deposits: {
        type: Boolean,
        default: true
      },
      transaction_history: {
        type: Boolean,
        default: true
      },
      data_export: {
        type: Boolean,
        default: true
      },
      finance_mods: {
        type: Boolean,
        default: true
      },
      fee_statistics: {
        type: Boolean,
        default: true
      }
    },
    fees_statistics_filter: {
      batch_level: [],
      batch_all: {
        type: String
      },
      department_level: [],
      department_all: {
        type: String
      },
      bank_level: [],
      master_level: [],
      loading: { type: Boolean, default: true}
    },
    member_module_unique: {
      type: String,
      unique: true
    },
    incomes: {
      type: Number,
      default: 0
    },
    expenses: {
      type: Number,
      default: 0
    },
    total_deposits: {
      type: Number,
      default: 0
    },
    excess_fees: {
      type: Number,
      default: 0
    },
    total_fees: {
      type: Number,
      default: 0
    },
    total_collect: {
      type: Number,
      default: 0
    },
    total_pending: {
      type: Number,
      default: 0
    },
    collect_by_student: {
      type: Number,
      default: 0
    },
    pending_by_student: {
      type: Number,
      default: 0
    },
    collect_by_government: {
      type: Number,
      default: 0
    },
    pending_from_government: {
      type: Number,
      default: 0
    },
    fees_to_be_collected_student: {
      type: Number,
      default: 0
    },
    fees_to_be_collected_government: {
      type: Number,
      default: 0
    },
    internal_fees: {
      type: Number,
      default: 0
    },
    internal_os_fees: {
      type: Number,
      default: 0
    },
    mismatch_excel: [
      {
        excel_file: { type: String },
        excel_file_name: { type: String },
        created_at: { type: Date, default: Date.now },
      },
    ],
    mismatch_excel_count: {
      type: Number,
      default: 0
    },
    total_fees_arr: [],
    total_collect_arr: [],
    total_pending_arr: [],
    collect_by_student_arr: [],
    pending_by_student_arr: [],
    collect_by_government_arr: [],
    pending_from_government_arr: [],
    fees_to_be_collected_student_arr: [],
    fees_to_be_collected_government_arr: [],
    admission_stats: {

    },
    admission_fees_statistics_filter: {
      batch_level: [],
      batch_all: {
        type: String
      },
      department_level: [],
      department_all: {
        type: String
      },
      bank_level: [],
      master_level: [],
      loading: { type: Boolean, default: true}
    },
    loading_fees: {
      type: Date,
      default: Date.now
    },
    loading_admission_fees: {
      type: Date,
      default: Date.now
    },
    scholarship_candidates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt"
      }
    ],
    scholarship_candidates_count: {
      type: Number,
      default: 0
    },
    offlineFeeCollection: [
      {
        fee: { type: Number, default: 0 },
        feeId: { type: String },
      },
    ],
    exemptFeeCollection: [
      {
        fee: { type: Number, default: 0 },
        feeId: { type: String },
      },
    ],
    onlineFeeCollection: [
      {
        fee: { type: Number, default: 0 },
        feeId: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Finance = mongoose.model("Finance", financeSchema);

module.exports = Finance;
