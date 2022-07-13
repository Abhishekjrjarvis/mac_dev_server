const mongoose = require("mongoose");

const instituteAdminSchema = new mongoose.Schema({
  insName: { type: String, required: true },
  name: { type: String, required: true, unique: true },
  insEmail: { type: String, required: true, unique: true },
  insPhoneNumber: { type: Number, required: true, maxlength: 10 },
  insMobileStatus: { type: String, default: "Not Verified" },
  insState: { type: String, required: true },
  insDistrict: { type: String, required: true },
  insPincode: { type: Number, required: true },
  insAddress: { type: String },
  insAbout: { type: String },
  insMode: { type: String, required: true },
  insDocument: { type: String },
  insPassword: { type: String },
  insType: { type: String, required: true },
  status: { type: String, default: "Not Approved" },
  insProfilePassword: { type: String },
  insEstdDate: { type: String },
  insRegDate: { type: String },
  insAchievement: { type: String },
  insAffiliated: { type: String },
  // referalPercentage: { type: String },
  rejectReason: { type: String },
  insEditableText: { type: String },
  insEditableTexts: { type: String },
  referalStatus: { type: String, default: "Pending" },
  insProfilePhoto: { type: String },
  insProfileCoverPhoto: { type: String },
  photoId: { type: String },
  coverId: { type: String },
  createdAt: { type: Date, default: Date.now },
  staffJoinCode: { type: String },
  bankAccountHolderName: { type: String },
  bankAccountNumber: { type: String },
  bankIfscCode: { type: String },
  bankAccountPhoneNumber: { type: String },
  insFreeLastDate: { type: String },
  insPaymentLastDate: { type: String },
  referalPercentage: { type: Number, default: 0 },
  insFreeCredit: { type: Number, default: 0 },
  transferCredit: { type: Number, default: 0 },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  announcement: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InsAnnouncement",
    },
  ],
  staff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  ApproveStaff: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],
  depart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  userFollowersList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  joinedUserList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  classRooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
  student: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  ApproveStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  saveInsPost: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  financeDepart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Finance",
    },
  ],
  sportDepart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
    },
  ],
  sportClassDepart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportClass",
    },
  ],
  addInstitute: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  addInstituteUser: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  leave: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave",
    },
  ],
  transfer: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transfer",
    },
  ],
  studentComplaints: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
  ],
  idCardBatch: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
  ],
  idCardField: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Field",
    },
  ],
  AllInstituteReferral: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  AllUserReferral: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  instituteReferral: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  userReferral: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  joinedPost: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  supportIns: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteSupport",
    },
  ],
  insBankBalance: {
    type: Number,
    default: 0,
  },
  insEContentBalance: {
    type: Number,
    default: 0,
  },
  insCreditBalance: {
    type: Number,
    default: 0,
  },
  insApplicationBalance: {
    type: Number,
    default: 0,
  },
  insAdmissionBalance: {
    type: Number,
    default: 0,
  },
  elearningActivate: { type: String, default: "Not Activated" },
  elearning: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ELearning",
  },
  libraryActivate: { type: String, default: "Not Activated" },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
  insAdmissionAdminStatus: { type: String, default: "Not Alloted" },
  insAdmissionAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AdmissionAdmin",
  },
  adminRepayAmount: {
    type: Number,
    default: 0,
  },
  submitCreditBalance: {
    type: Number,
    default: 0,
  },
  iNotify: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
    },
  ],
  classCodeList: [],
  displayPersonList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DisplayPerson",
    },
  ],
  starAnnouncement: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InsAnnouncement",
    },
  ],
  recoveryMail: {
    type: String,
  },
  followersCount: {
    type: Number,
    default: 0,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
  departmentCount: {
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
  postCount: {
    type: Number,
    default: 0,
  },
  announcementCount: {
    type: Number,
    default: 0,
  },
  admissionCount: {
    type: Number,
    default: 0,
  },
  isUniversal: {
    type: String,
    default: "Not Assigned",
  },
  paymentBankStatus: { type: String },
  GSTInfo: { type: String },
  accessFeature: { type: String, default: 'Locked'},
  unlockAmount: { type: Number, default: 1000},
  featurePaymentStatus: { type: String, default: 'Not Paid'},
  staffAttendance: [
    { type: mongoose.Schema.Types.ObjectId, ref: "StaffAttendenceDate" },
  ],
  userProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralArray: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referral'
    }
  ]
});

instituteAdminSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Post.deleteMany({
      _id: {
        $in: doc.posts,
      },
    });
  }
});

const InstituteAdmin = mongoose.model("InstituteAdmin", instituteAdminSchema);

module.exports = InstituteAdmin;
