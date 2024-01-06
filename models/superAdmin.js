const mongoose = require("mongoose");

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
  adminStatus: { type: String, default: "Not Verified" },
  // adminRecoveryPhrase: { type: String, unique: true },
  isAdmin: { type: String, default: "Not Assigned" },
  instituteList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  referals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  ApproveInstitute: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  RejectInstitute: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  ViewInstitute: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  blockedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  instituteIdCardBatch: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
  ],
  reportList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
    },
  ],
  referalsIns: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  idCardPrinting: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
  ],
  idCardPrinted: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
  ],
  idCardBalance: {
    type: Number,
    default: 0,
  },
  creditBalance: {
    type: Number,
    default: 0,
  },
  idCardPaymentList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IdCardPayment",
    },
  ],
  feedbackList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
    },
  ],
  creditPaymentList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CreditPayment",
    },
  ],
  getTouchUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GetTouch",
    },
  ],
  careerUserArray: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Career",
    },
  ],
  instituteCount: {
    type: Number,
    default: 0,
  },
  userCount: {
    type: Number,
    default: 0,
  },
  staffCount: {
    type: Number,
    default: 0,
  },
  studentCount: {
    type: Number,
    default: 0,
  },
  reportPostQueryCount: {
    type: Number,
    default: 0,
  },
  postCount: {
    type: Number,
    default: 0,
  },
  playlistCount: {
    type: Number,
    default: 0,
  },
  paymentCount: {
    type: Number,
    default: 0,
  },
  requestInstituteCount: {
    type: Number,
    default: 0,
  },
  featureAmount: {
    type: Number,
    default: 0,
  },
  returnAmount: {
    type: Number,
    default: 0,
  },
  application_charges_collection: {
    type: Number,
    default: 0,
  },
  careerCount: {
    type: Number,
    default: 0,
  },
  getTouchCount: {
    type: Number,
    default: 0,
  },
  repayArray: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RePay",
    },
  ],
  activateAccount: {
    type: Number,
    default: 0,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  saveAdminPost: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  photoId: {
    type: String,
  },
  profilePhoto: {
    type: String,
  },
  staffArray: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  studentArray: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  assignUniversal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  assignUniversalStatus: {
    type: String,
    default: "Not Assigned",
  },
  aNotify: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    },
  ],
  feedbackArray: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeedBack",
    },
  ],
  exploreFeatureList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderPayment",
    },
  ],
  supportUserChat: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportChat",
    },
  ],
  supportInstituteChat: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportChat",
    },
  ],
  reported_end_user: [
    {
      end_user: { type: String },
      report_by: { type: String },
      account_status: { type: String, default: "Not Block" },
      created_at: { type: Date, default: Date.now },
    },
  ],
  reported_end_user_count: {
    type: Number,
    default: 0,
  },
  invoice_count: {
    type: Number,
    default: 0,
  },
  dynamic_invoice_count: {
    type: String,
  },
  sub_domain_count: {
    type: Number,
    default: 0,
  },
  sub_domain_array: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubDomain",
    },
  ],
  alarm_student: [
    {
      created_at: {
        type: Date,
        default: Date.now,
      },
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      alarm_mode: {
        type: String,
      },
      content: {
        type: String,
      },
    },
  ],
  alarm_student_count: {
    type: Number,
    default: 0,
  },
  charges: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charges"
    }
  ],
  charges_count: {
    type: Number,
    default: 0
  }
});

const Admin = mongoose.model("Admin", superAdminSchema);

module.exports = Admin;
