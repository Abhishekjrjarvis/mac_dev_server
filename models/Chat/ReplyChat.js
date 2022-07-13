const mongoose = require('mongoose')

const replyChatSchema = new mongoose.Schema({
    reply:{
        type: Boolean,
        default: false
    },
    replyContent: {
        type: String,
        trim: true
    },
    replySender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    replyIndex: {
        type: String,
        required: true
    },
    delievered: {
        type: String,
        default: false
    },
}, {timestamps: true})

module.exports = mongoose.model('ReplyChat', replyChatSchema)