const mongoose = require('mongoose')


const referralSchema = new mongoose.Schema({
    referralPercentage: {
        type: Number,
        default: 0
    },
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
    }
})

module.exports = mongoose.model('Referral', referralSchema)