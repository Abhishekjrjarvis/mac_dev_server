const mongoose = require("mongoose");

const payrollModuleSchema = new mongoose.Schema({
    payroll_manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstituteAdmin"
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    employer_details: {
        employer_name: {
            type: String
        },
        employer_address: {
            type: String
        },
        employer_pincode: {
            type: String
        },
        employer_state: {
            type: String
        },
        employer_email: {
            type: String
        },
        employer_contact: {
            type: String
        },
        employer_district: {
            type: String
        },
        employer_pan: {
            type: String
        },
        employer_tan: {
            type: String
        },
        employer_cin: {
            type: String
        },
    },
    salary_structure: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SalaryStructure"
        }
    ],
    salary_heads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SalaryHeads"
        }
    ],
    salary_custom_heads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SalaryHeads"
        }
    ],
    basic_pay_linked_head_status: {
        master: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FeeMaster",
          },
          status: { type: String, default: "Not Linked" },
    },
    da_linked_head_status: {
        master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      status: { type: String, default: "Not Linked" },
    },
    hra_linked_head_status: {
        master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      status: { type: String, default: "Not Linked" },
    },
    advance_salary_linked_head_status: {
        master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      status: { type: String, default: "Not Linked" },
    },
    bonus_linked_head_status: {
        master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      status: { type: String, default: "Not Linked" },
    },
    arrears_linked_head_status: {
        master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      status: { type: String, default: "Not Linked" },
    },
    employee_pf_linked_head_status: {
        master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      status: { type: String, default: "Not Linked" },
    },
    advance_salary_deduction_linked_head_status: {
        master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      status: { type: String, default: "Not Linked" },
    },
    pt_linked_head_status: {
        master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      status: { type: String, default: "Not Linked" },
    },
    emplyee_esi_linked_head_status: {
        master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      status: { type: String, default: "Not Linked" },
    },

    employar_pf_linked_head_status: {
        master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      status: { type: String, default: "Not Linked" },
    },
    gratuity_linked_head_status: {
        master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      status: { type: String, default: "Not Linked" },
    },
    emplyar_esi_linked_head_status: {
        master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      status: { type: String, default: "Not Linked" },
    },
    tds_linked_head_status: {
        master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      status: { type: String, default: "Not Linked" },
    },
    monthly_funds: [
        {
            month: { type: String },
            year: { type: String },
            net_allocate_pay: { type: Number, default: 0 }
        }
    ],
    pay_slip: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PaySlip"
        }
    ],
    financial_data: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TDSFinance"
        }
    ]
});

module.exports = mongoose.model("PayrollModule", payrollModuleSchema);
