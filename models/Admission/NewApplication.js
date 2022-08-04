const mongoose = require('mongoose')

const newApplicationSchema = new mongoose.Schema({
    applicationName: { type: String, required: true },
    applicationDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    applicationBatch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
     },
    applicationSeats: { type: Number, required: true },
    applicationType: { type: String, required: true },
    applicationStartDate: { type: String, required: true },
    applicationEndDate: { type: String, required: true },
    applicationFee: { type: Number, required: true },
    applicationAbout: { type: String, required: true },
    applicationStatus: { type: String, default: 'Ongoing' },
    createdAt: {
        type: Date,
        default: Date.now
    },
    admissionAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admission'
    },
    receievedApplication: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],
    selectedApplication: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],
    confirmedApplication: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ]
})

module.exports = mongoose.model('NewApplication', newApplicationSchema)