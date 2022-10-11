const mongoose = require('mongoose')


const statusSchema = new mongoose.Schema({
    content: { type: String, required: true},
    status: { type: String },
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NewApplication'
    },
    payMode: { type: String },
    isPaid: { type: String, default: 'Not Paid'},
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Status', statusSchema)