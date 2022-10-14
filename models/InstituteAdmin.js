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
  rejectReason: { type: String },
  insEditableText_one: { type: String },
  insEditableText_two: { type: String },
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
  bankAccountType: { type: String },
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
  previousApproveStaff: [
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
  admissionDepart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admission",
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
  staffComplaints: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StaffComplaint",
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
  joinedPost: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
  financeDetailStatus: {
    type: String,
    default: "Not Added",
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
  businessName: { type: String },
  businessAddress: { type: String },
  accessFeature: { type: String, default: "Locked" },
  unlockAmount: { type: Number, default: 1000 },
  featurePaymentStatus: { type: String, default: "Not Paid" },
  staffAttendance: [
    { type: mongoose.Schema.Types.ObjectId, ref: "StaffAttendenceDate" },
  ],
  recentChat: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
  ],
  referralArray: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
    },
  ],
  initialReferral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  activateStatus: {
    type: String,
    default: "Not Activated",
  },
  activateDate: {
    type: String,
  },
  supportChat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SupportChat",
  },
  financeStatus: {
    type: String,
    default: "Disable",
  },
  admissionStatus: {
    type: String,
    default: "Disable",
  },
  sportStatus: {
    type: String,
    default: "Disable",
  },
  sportClassStatus: {
    type: String,
    default: "Disable",
  },
  deviceToken: {
    type: String,
  },
  leavingArray: [],
  bonaArray: [],
  getReturn: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RePay",
    },
  ],
  institute_saved_post: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  tag_post: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  questionCount: {
    type: Number,
    default: 0,
  },
  pollCount: {
    type: Number,
    default: 0,
  },
  staff_privacy: {
    type: String,
    default: "Every one",
  },
  email_privacy: {
    type: String,
    default: "Every one",
  },
  contact_privacy: {
    type: String,
    default: "Every one",
  },
  tag_privacy: {
    type: String,
    default: "Every one",
  },
  ins_latitude: {
    type: Number,
  },
  ins_longitude: {
    type: Number,
  },
  ins_accuracy: {
    type: Number,
  },
  ins_altitude: {
    type: Number,
  },
  ins_speed: {
    type: Number,
  },
  ins_heading: {
    type: Number,
  },
  ins_time: {
    type: String,
  },
  ins_isMock: {
    type: Boolean,
  },
  one_line_about: {
    type: String,
  },
  blockStatus: {
    type: String,
    default: "UnBlocked",
  },
  initial_Unlock_Amount: {
    type: Number,
    default: 0,
  },
  followers_critiria: {
    type: Number,
    default: 0,
  },
  profileQRCode: {
    type: String,
  },
  profileURL: {
    type: String,
  },
  modal_activate: {
    type: String,
  },
  activeStatus: {
    type: String,
    default: "Activated",
  },
  activeDate: {
    type: String,
  },
  staffFormSetting: {
    fullName: { type: Boolean, defult: true },
    staffDOB: { type: Boolean, defult: true },
    staffGender: { type: Boolean, defult: true },
    staffNationality: { type: Boolean, defult: false },
    staffMTongue: { type: Boolean, defult: false },
    staffMotherName: { type: Boolean, defult: false },
    staffCast: { type: Boolean, defult: false },
    staffCastCategory: { type: Boolean, defult: false },
    staffReligion: { type: Boolean, defult: false },
    staffBirthPlace: { type: Boolean, defult: false },
    staffDistrict: { type: Boolean, defult: false },
    staffState: { type: Boolean, defult: false },
    staffAddress: { type: Boolean, defult: false },
    staffPhoneNumber: { type: Boolean, defult: false },
    staffAadharNumber: { type: Boolean, defult: false },
    staffQualification: { type: Boolean, defult: false },
    staffAadharFrontCard: { type: Boolean, defult: false },
    staffAadharBackCard: { type: Boolean, defult: false },
    staffPanNumber: { type: Boolean, defult: false },
    staffBankDetails: { type: Boolean, defult: false },
    staffUpiId: { type: Boolean, defult: false },
    staffCasteCertificate: { type: Boolean, defult: false },
  },
  studentFormSetting: {
    fullName: { type: Boolean, default: true },
    studentDOB: { type: Boolean, default: true },
    studentGender: { type: Boolean, default: true },
    studentNationality: { type: Boolean, default: false },
    studentMTongue: { type: Boolean, default: false },
    studentMotherName: { type: Boolean, default: false },
    studentCast: { type: Boolean, default: false },
    studentCastCategory: { type: Boolean, default: false },
    studentReligion: { type: Boolean, default: false },
    studentBirthPlace: { type: Boolean, default: false },
    studentDistrict: { type: Boolean, default: false },
    studentState: { type: Boolean, default: false },
    studentAddress: { type: Boolean, default: false },
    studentPhoneNumber: { type: Boolean, default: false },
    studentAadharNumber: { type: Boolean, default: false },
    studentParentsName: { type: Boolean, default: false },
    studentParentsPhoneNumber: { type: Boolean, default: false },
    studentAadharFrontCard: { type: Boolean, default: false },
    studentAadharBackCard: { type: Boolean, default: false },
    studentPanNumber: { type: Boolean, default: false },
    studentBankDetails: { type: Boolean, default: false },
    studentCasteCertificate: { type: Boolean, default: false },
  },
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
