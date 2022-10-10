const mongoose = require('mongoose')


const admissionAdminSchema = new mongoose.Schema({
    admissionAdminName: { type: String },
    admissionAdminEmail: { type: String },
    admissionAdminPhoneNumber: { type: String },
    admissionAdminAbout: { type: String },
    admissionAdminHead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    photoId: { type: String, default: "1" },
    coverId: { type: String, default: "2" },
    photo: { type: String },
    cover: { type: String },
    createdAt: {
        type: Date,
        default: Date.now
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin'
    },
    newApplication: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'NewApplication'
        }
    ],
    newAppCount: {
        type: Number,
        default: 0
    },
    offlineFee: {
        type: Number,
        default: 0
    },
    onlineFee: {
        type: Number,
        default: 0
    },
    queryCount: {
        type: Number,
        default: 0
    },
    remainingFee: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],
    inquiryList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Inquiry'
        }
    ]
})

module.exports = mongoose.model('Admission', admissionAdminSchema)