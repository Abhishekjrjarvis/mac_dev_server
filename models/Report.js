const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
    reportStatus: {
        type: String
    },
    reportBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    reportUserPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserPost'
    },
    reportInsPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }
})


const Report = mongoose.model('Report', reportSchema)

module.exports = Report