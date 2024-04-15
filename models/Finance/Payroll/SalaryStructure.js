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
})

module.exports = mongoose.model("SalaryStructure", salaryStructureSchema)