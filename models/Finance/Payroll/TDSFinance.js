const mongoose = require("mongoose")

const tdsFinanceSchema = new mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
    },
    payroll: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PayrollModule"
    },
    year: {
        type: String
    }
})

module.exports = mongoose.model("TDSFinance", tdsFinanceSchema)