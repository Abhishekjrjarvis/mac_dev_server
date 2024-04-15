const mongoose = require("mongoose")

const salaryStructureSchema = new mongoose.Schema({
    payroll: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PayrollModule"
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    salary_components: [
        {
            head_amount: { type: Number, default: 0 },
            created_at: { type: Date, default: Date.now },
            master: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "SalaryHeads",
            },
          },
    ],
    employee_deduction: [
        {
            head_amount: { type: Number, default: 0 },
            created_at: { type: Date, default: Date.now },
            master: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "SalaryHeads",
            },
          },
    ],
    employar_deduction: [
        {
            head_amount: { type: Number, default: 0 },
            created_at: { type: Date, default: Date.now },
            master: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "SalaryHeads",
            },
          },
    ],
    compliances: [
        {
            head_amount: { type: Number, default: 0 },
            created_at: { type: Date, default: Date.now },
            master: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "SalaryHeads",
            },
          },
    ],
    structure_status: {
        type: String
    },
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
    },
    staff_net_pay: {
        type: Number,
        default: 0
    },
    staff_total_earnings: {
        type: Number,
        default: 0
    },
    staff_total_pay: {
        type: Number,
        default: 0
    },
    staff_ctc: {
        type: Number,
        default: 0
    },
    choose_tax_regime: {
        type: String
    },
    tds_calculation: {
        income_from_sal: {
            actual_rent: { type: Number, default: 0 },
            other_allowances: { type: Number, default: 0 },
            salary_from_other: { type: Number, default: 0 },
        },
        income_from_house: {
            income_from_hp: { type: Number, default: 0 },
            municiple_tax_paid: { type: Number, default: 0 },
            interest_self: { type: Number, default: 0 },
            interest_let_out: { type: Number, default: 0 },
        },
        income_from_os: {
            income_from_other: { type: Number, default: 0 },
        },
        deductions: {
            Sec_80C_80CCC_80CCD: { type: Number, default: 0 },
            Sec_80D: { type: Number, default: 0 },
            Sec_80G: { type: Number, default: 0 },
            Sec_80GG: { type: Number, default: 0 },
            Sec_80TTA: { type: Number, default: 0 },
            other: { type: Number, default: 0 },
        }
    },
    financial_data: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TDSFinance"
        }
    ]
})

module.exports = mongoose.model("SalaryStructure", salaryStructureSchema)