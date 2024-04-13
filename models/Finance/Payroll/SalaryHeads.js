const mongoose = require("mongoose");

const salaryHeadsSchema = new mongoose.Schema({
    payroll: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PayrollModule"
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    structure_status: {
        type: String,
        default: "Not Fixed"
    },
    structure_grant_status: {
        type: String,
    },
    salary_components: {
        basic_pay: {
            price: {
                type: Number,
                default: 0
            }
        },
        dearness_allowances: {
            price: {
                type: Number,
                default: 0
            },
            toggle: {
                type: Boolean,
                default: true
            }
        },
        house_rent_allowances: {
            price: {
                type: Number,
                default: 0
            },
            toggle: {
                type: Boolean,
                default: true
            }
        },
        allowances: [
            {
                name: {
                    type: String
                },
                price: {
                    type: Number,
                    default: 0
                },
                toggle: {
                    type: Boolean,
                    default: false
                }
            }
        ],
        perquisites: [
            {
                name: {
                    type: String
                },
                price: {
                    type: Number,
                    default: 0
                },
            }
        ],
        bonus: [
            {
                name: {
                    type: String
                },
                price: {
                    type: Number,
                    default: 0
                },
            }
        ],
        arrears: [
            {
                name: {
                    type: String
                },
                price: {
                    type: Number,
                    default: 0
                },
            }
        ],
        advance_salary: [
            {
                name: {
                    type: String
                },
                price: {
                    type: Number,
                    default: 0
                },
            }
        ]
    },
    employee_deduction: {
        advance_salary: [
            {
                name: {
                    type: String
                },
                price: {
                    type: Number,
                    default: 0
                },
            }
        ],
        professional_tax: {
            price: {
                type: Number,
                default: 0
            },
            condition: {
                type: String,
                default: "1. Less than Rs. 7000 -> \n\n (i) Rs.175 for male \n\n (ii) Rs. 0 for female \n\n 2. Greater Than Rs. 7000 \n\n (i) Rs. 200 for Both male & female"
            }
        },
        employee_provident_fund: {
            price: {
                type: Number,
                default: 0 
            },
            condition: {
                type: String,
                default: "12 % of (Basic Pay + Dearness Allowances)"
            }
        },
        employee_state_insurance: {
            price: {
                type: Number,
                default: 0 
            },
            condition: {
                type: String,
                default: "(Applicable ESI) -> \n\n 0.75 % of Gross Pay \n\n 1. if Gross pay is less than Rs. 21000 "
            }
        }
    },
    employar_deduction: {
        employar_provident_fund: {
            price: {
                type: Number,
                default: 0 
            },
            condition: {
                type: String,
            }
        },
        employar_state_insurance: {
            price: {
                type: Number,
                default: 0 
            },
            condition: {
                type: String,
                default: "(Applicable ESI) -> \n\n 3.25 % of Gross Pay"
            }
        },
        gratuity: {
            price: {
                type: Number,
                default: 0 
            },
            condition: {
                type: String,
            }
        }
    },
    compliances: {
        tds: {
            area: {
                type: String
            },
            area_deduct: {
                type: Number,
                default: 0
            }
        }
    }
});

module.exports = mongoose.model("SalaryHeads", salaryHeadsSchema);
