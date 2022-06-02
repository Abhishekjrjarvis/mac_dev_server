const mongoose = require('mongoose')


const touchSchema = new mongoose.Schema({
    endUserName: {
        type: String,
        required: true
    },
    endUserPhoneNumber: {
        type: String,
        required: true
    },
    endUserEmail: {
        type: String,
        required: true,
        unique: true
    },
    endUserMessage: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


module.exports = mongoose.model('GetTouch', touchSchema)