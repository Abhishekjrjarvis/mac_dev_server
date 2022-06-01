const mongoose = require('mongoose')
const User = require('./User')
const InstituteAdmin = require('./InstituteAdmin')

const displaySchema = new mongoose.Schema({
    displayTitle: {
        type: String,
        required: true
    },
    displayUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    displayBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin'
    }
})


module.exports = mongoose.model('DisplayPerson', displaySchema)