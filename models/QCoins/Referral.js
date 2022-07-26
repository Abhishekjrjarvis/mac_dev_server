const mongoose = require('mongoose')


const referralSchema = new mongoose.Schema({
    referralBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin'
    },
    referralTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    referralEarnStatus: {
        type: String
    }
})

module.exports = mongoose.model('Referral', referralSchema)