const mongoose = require('mongoose')

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
    // adminRecoveryPhrase: { type: String, unique: true },
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
    ],
    instituteCount: {
        type: Number,
        default: 0
    },
    userCount: {
        type: Number,
        default: 0
    },
    staffCount: {
        type: Number,
        default: 0
    },
    studentCount: {
        type: Number,
        default: 0
    },
    reportPostQueryCount: {
        type: Number,
        default: 0
    },
    postCount: {
        type: Number,
        default: 0
    },
    playlistCount: {
        type: Number,
        default: 0
    },
    paymentCount: {
        type: Number,
        default: 0
    },
    requestInstituteCount: {
        type: Number, 
        default: 0
    },
    featureAmount: {
        type: Number,
        default: 0
    },
    activateAccount: {
        type: Number,
        default: 0
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    saveAdminPost: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    photoId: {
        type: String
    },
    profilePhoto: {
        type: String
    },
    staffArray: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff'
        }
    ],
    studentArray: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],
    assignUniversal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstituteAdmin'
    },
    aNotify: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Notification'
        }
    ],
    exploreFeatureList: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'IdCardPayment'
        }
    ]
    
})

const Admin = mongoose.model('Admin', superAdminSchema)

module.exports = Admin
