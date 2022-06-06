const mongoose = require('mongoose')
const InstituteAdmin = require('./InstituteAdmin')
const User = require('./User')
const Report = require('./Report')
const IdCardPayment = require('./IdCardPayment')
const CreditPayment = require('./CreditPayment')
const Feedback = require('./Feedback')

const superAdminSchema = new mongoose.Schema({
    adminName: { type: String, required: true },
    adminPhoneNumber: { type: Number, required: true },
    adminEmail: { type: String, required: true, unique: true },
    adminPassword: { type: String, required: true, unique: true },
    adminUserName: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    adminDateOfBirth: { type: String },
    adminGender: { type: String },
    adminAddress: { type: String },
    adminBio: { type: String },
    adminCity: { type: String },
    adminState: { type: String },
    adminAadharCard: { type: String },
    photoId: { type: String },
    adminStatus: { type: String, default: 'Not Verified'},
    adminRecoveryPhrase: { type: String, unique: true },
    isAdmin: { type: String, default: 'Not Assigned' },
    instituteList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InstituteAdmin'
        }
    ],
    referals: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    ApproveInstitute: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InstituteAdmin'
        }
    ],
    RejectInstitute: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'InstituteAdmin'
        }
    ],
    ViewInstitute: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InstituteAdmin'
        }
    ],
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    blockedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    instituteIdCardBatch: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch'
        }
    ],
    reportList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Report'
        }
    ],
    referalsIns: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InstituteAdmin'
        }
    ],
    idCardPrinting: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch'
        }
    ],
    idCardPrinted: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch'
        }
    ],
    idCardBalance: {
        type: Number,
        default: 0
    },
    creditBalance: {
        type: Number,
        default: 0
    },
    idCardPaymentList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'IdCardPayment'
        }
    ],
    feedbackList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Feedback'
        }
    ],
    creditPaymentList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CreditPayment'
        }
    ],
    getTouchUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GetTouch'
        }
    ],
    careerUserArray: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Career'
        }
    ]
    
})

const Admin = mongoose.model('Admin', superAdminSchema)

module.exports = Admin
