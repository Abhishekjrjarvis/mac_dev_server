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
    },
    salary_structure: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SalaryHeads"
        }
    ]
});

module.exports = mongoose.model("PayrollModule", payrollModuleSchema);
