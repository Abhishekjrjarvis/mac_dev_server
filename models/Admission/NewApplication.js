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
    remainingFee: { type: Number, default: 0 },
    applicationAbout: { type: String, required: true },
    applicationStatus: { type: String, default: 'Ongoing' },
    receievedCount: { type: Number, default: 0 },
    selectCount: { type: Number, default: 0 },
    confirmCount: { type: Number, default: 0 },
    cancelCount: { type: Number, default: 0 },
    allotCount: { type: Number, default: 0 },
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