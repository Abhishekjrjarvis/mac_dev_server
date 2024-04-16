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
        type: Number, default: 0
    },
    one_day_sal: {type: Number, default: 0},
    basic_pay: {type: Number, default: 0},
    da: {type: Number, default: 0},
    hra: {type: Number, default: 0},
    allowance: {type: Number, default: 0},
    bonus: {type: Number, default: 0},
    perks: {type: Number, default: 0},
    ads: {type: Number, default: 0},
    arr: {type: Number, default: 0},
    total_earnings: {type: Number, default: 0},
    pt: {type: Number, default: 0},
    employee_si: {type: Number, default: 0},
    ads_deduct: {type: Number, default: 0},
    employee_pf: {type: Number, default: 0},
    total_pay: {type: Number, default: 0},
    employar_si: {type: Number, default: 0},
    employar_pf: {type: Number, default: 0},
    gratuity: {type: Number, default: 0},
    net_pay: {type: Number, default: 0},
    tds: {type: Number, default: 0},
    employar_ps: {type: Number, default: 0},
    employar_charges: {type: Number, default: 0},
    ctc: {type: Number, default: 0}
})

module.exports = mongoose.model("SalaryStructure", salaryStructureSchema)
