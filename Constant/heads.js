module.exports.s_c = [
    {
        heads_name: "Basic Pay",
        heads_toggle: false,
        heads_type: "SALARY_COMPONENTS",
        heads_key: "BASIC_PAY",
        heads_status: "Not Linked"
    },
    {
        heads_name: "Dearness Allowances",
        heads_toggle: true,
        heads_type: "SALARY_COMPONENTS",
        heads_key: "DA",
        heads_status: "Not Linked"
    },
    {
        heads_name: "House Rent Allowances",
        heads_toggle: true,
        heads_type: "SALARY_COMPONENTS",
        heads_key: "HRA",
        heads_status: "Not Linked"
    },
    {
        heads_name: "Travel",
        heads_toggle: true,
        heads_type: "SALARY_COMPONENTS",
        heads_parent: "ALLOWANCES",
        heads_key: "ALLOWANCES"
    },
    {
        heads_name: "Travel Perks",
        heads_toggle: true,
        heads_type: "SALARY_COMPONENTS",
        heads_parent: "PERQUISITES",
        heads_key: "PERQUISITES"
    },
    {
        heads_name: "Medical Perks",
        heads_toggle: true,
        heads_type: "SALARY_COMPONENTS",
        heads_parent: "BONUS",
        heads_key: "BONUS",
        heads_status: "Not Linked"
    },
    {
        heads_name: "Medical Perks",
        heads_toggle: true,
        heads_type: "SALARY_COMPONENTS",
        heads_parent: "BONUS",
        heads_key: "BONUS",
        heads_status: "Not Linked"
    },
    {
        heads_name: "Advance Salary",
        heads_toggle: false,
        heads_type: "SALARY_COMPONENTS",
        heads_key: "ADVANCE_SALARY",
        heads_status: "Not Linked"
    },
],

module.exports.employee = [
    {
        heads_name: "Employee Provident Fund",
        heads_toggle: false,
        heads_type: "EMPLOYEE_DEDUCTION",
        heads_key: "PF",
        heads_status: "Not Linked"
    },
    {
        heads_name: "Advance Salary Deduction",
        heads_toggle: false,
        heads_type: "EMPLOYEE_DEDUCTION",
        heads_key: "ADVANCE_SALARY_DEDUCTION",
        heads_status: "Not Linked"
    },
    {
        heads_name: "Professional Tax",
        heads_toggle: false,
        heads_type: "EMPLOYEE_DEDUCTION",
        heads_key: "PT",
        heads_status: "Not Linked"
    },
    {
        heads_name: "Arrears",
        heads_toggle: true,
        heads_type: "EMPLOYEE_DEDUCTION",
        heads_parent: "ARREARS",
        heads_key: "ARREARS",
        heads_status: "Not Linked"
    },
    {
        heads_name: "ESI",
        heads_toggle: true,
        heads_type: "EMPLOYEE_DEDUCTION",
        heads_parent: "ESI",
        heads_key: "ESI",
        heads_status: "Not Linked",
    },
]

module.exports.employar = [
    {
        heads_name: "EPF",
        heads_toggle: false,
        heads_type: "EMPLOYAR_DEDUCTION",
        heads_key: "EPF",
        heads_status: "Not Linked"
    },
    {
        heads_name: "ESI",
        heads_toggle: false,
        heads_type: "EMPLOYAR_DEDUCTION",
        heads_key: "ESI",
        heads_status: "Not Linked"
    },
    {
        heads_name: "Grauity",
        heads_toggle: false,
        heads_type: "EMPLOYAR_DEDUCTION",
        heads_key: "GRAUITY",
        heads_status: "Not Linked"
    },
]

module.exports.compliance = [
    {
        heads_name: "TDS",
        heads_toggle: false,
        heads_type: "COMPLIANCES",
        heads_key: "TDS",
        heads_status: "Not Linked"
    },
]