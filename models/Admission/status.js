const mongoose = require('mongoose')


const statusSchema = new mongoose.Schema({
    content: { type: String, required: true},
    status: { type: String },
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NewApplication'
    },
    createdtAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Status', statusSchema)