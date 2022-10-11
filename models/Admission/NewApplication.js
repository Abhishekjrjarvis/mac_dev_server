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
    admissionFee: { type: Number, required: true },
    // applicationFee: { type: Number, required: true },
    remainingFee: { type: Number, default: 0 },
    applicationAbout: { type: String, required: true },
    applicationStatus: { type: String, default: 'Ongoing' },
    receievedCount: { type: Number, default: 0 },
    selectCount: { type: Number, default: 0 },
    confirmCount: { type: Number, default: 0 },
    cancelCount: { type: Number, default: 0 },
    allotCount: { type: Number, default: 0 },
    collectedFeeCount: { type: Number, default: 0 },
    createdAt: {
        type: Date,
        default: Date.now
    },
    admissionAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admission'
    },
    offlineFee: { type: Number, default: 0 },
    onlineFee: { type: Number, default: 0 },
    receievedApplication: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student'
            },
            apply_on: { type: Date, default: Date.now},
            fee_remain: { type: Number, default: 0},
        },
    ],
    selectedApplication: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student'
            },
            select_on: { type: Date, default: Date.now},
            payment_status: { type: String, default: 'Pending'},
            fee_remain: { type: Number, default: 0},
        },
    ],
    confirmedApplication: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student'
            },
            apply_on: { type: Date, default: Date.now},
            payment_status: { type: String, default: 'Pending'},
            alloted_class: { type: String, default: 'Pending'},
            alloted_status: { type: String, default: 'Not Alloted'},
            fee_remain: { type: Number, default: 0},
        },
    ]
})

module.exports = mongoose.model('NewApplication', newApplicationSchema)