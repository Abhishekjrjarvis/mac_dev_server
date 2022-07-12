const mongoose = require('mongoose')

const forwardMessageSchema = new mongoose.Schema({
    isForward:{
        type: Boolean,
        default: false
    },
    forwardIndex: {
        type: String,
        // required: true
    },
    delievered: {
        type: String,
        default: false
    },
}, {timestamps: true})

module.exports = mongoose.model('ForwardMessage', forwardMessageSchema)