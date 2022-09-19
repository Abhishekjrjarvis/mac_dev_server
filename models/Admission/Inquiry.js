const mongoose = require('mongoose')


const inquirySchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: { 
        type: String,
        default: 'Not Resolved' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    reasonType: { type: String },
    reasonExplanation: [
        {
            content: { type: String },
            replyBy: { type: String },
        }
    ]
},
{ timestamps: true }
)

module.exports = mongoose.model('Inquiry', inquirySchema)