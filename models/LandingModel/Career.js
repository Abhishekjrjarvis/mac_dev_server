const mongoose = require('mongoose')


const careerSchema = new mongoose.Schema({
    endUserName: {
        type: String,
        required: true
    },
    endUserPhoneNumber: {
        type: String,
        required: true
    },
    endUserAddress: {
        type: String,
        required: true
    },
    endUserResume: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    endUserStatus: {
        type: String,
        default: 'Applied'
    },
    endUserEmail: {
        type: String,
        required: true,
        unique: true
    }
})


module.exports = mongoose.model('Career', careerSchema)