const mongoose = require('mongoose')

const payrollSchema = new mongoose.Schema({
    staff_salary_month: {
        type: Number,
        default: 0
    },
    staff_total_paid_leaves: {
        type: Number,
        default: 0
    },
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    pay_slip: [
        {
          month: { type: String },
          attendence: { type: Number, default: 0},
          total_leaves: { type: Number, default: 0},
          paid_leaves: { type: Number, default: 0},
          payment_mode: { type: String },
          purpose: { type: String, default: 'Monthly Salary' },
          amount: { type: Number, default: 0},
          paid_to: { type: String },
          message: { type: String },
          is_paid: { type: String, default: 'Not Paid'},
          gross_salary: { type: Number, default: 0},
          net_total: { type: Number, default: 0},
          hra: { type: Number, default: 0},
          tds: { type: Number, default: 0},
          epf: { type: Number, default: 0},
          da: { type: Number, default: 0},
          medical_allowance: { type: Number, default: 0},
          travel_allowance: { type: Number, default: 0},
          perquisites: { type: Number, default: 0},
          employer_contribution: { type: Number, default: 0},
        },
    ],
    h_r_a: {
        type: Number,
        default: 0
    },
    d_a: {
        type: Number,
        default: 0
    },
    t_d_s: {
        type: Number,
        default: 0
    },
    e_p_f: {
        type: Number,
        default: 0
    },
    medical_allowance: {
        type: Number,
        default: 0
    },
    travel_allowance: {
        type: Number,
        default: 0
    },
    perquisites: {
        type: Number,
        default: 0
    },
    employer_contribution: {
        type: Number,
        default: 0
    }

})

module.exports = mongoose.model('Payroll', payrollSchema)