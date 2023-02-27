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
  b_certificate_count: { type: Number, default: 0 },
  l_certificate_count: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  staffJoinCode: { type: String, unique: true },
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
  batches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
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
  elearningStatus: { type: String, default: "Disable" },
  elearningDepart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ELearning",
    },
  ],
  libraryActivate: { type: String, default: "Disable" },
  library: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
    },
  ],
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
  last_seen: {
    type: Date,
  },
  paymentBankStatus: { type: String },
  GSTInfo: { type: String },
  businessName: { type: String },
  businessAddress: { type: String },
  gstSlab: { type: Number, default: 18 },
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
  sms_lang: {
    type: String,
    default: "en",
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
  ins_distance: {
    type: Number,
    default: 0,
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
  activeStatus: {
    type: String,
    default: "Activated",
  },
  activeDate: {
    type: String,
  },
  staffFormSetting: {
    personalInfo: { type: Boolean, default: true },
    otherPersonalInfo: { type: Boolean, default: false },
    identityDetails: { type: Boolean, default: false },
    addressInfo: { type: Boolean, default: false },
    previousSchoolAndDocument: {
      previousSchoolDocument: { type: Boolean, default: false },
      aadharCard: { type: Boolean, default: false },
      identityDocument: { type: Boolean, default: false },
      casteCertificate: { type: Boolean, default: false },
      joiningTransferLetter: { type: Boolean, default: false },
      leavingTransferCertificate: { type: Boolean, default: false },
      incomeCertificate: { type: Boolean, default: false },
      lastYearMarksheet: { type: Boolean, default: false },
      nationalityCertificate: { type: Boolean, default: false },
      domicileCertificate: { type: Boolean, default: false },
      nonCreamyLayerCertificate: { type: Boolean, default: false },
    },
    bankDetails: { type: Boolean, default: false },
  },
  studentFormSetting: {
    personalInfo: { type: Boolean, default: true },
    enrollmentPrn: { type: Boolean, default: false },
    otherPersonalInfo: { type: Boolean, default: false },
    identityDetails: { type: Boolean, default: false },
    addressInfo: { type: Boolean, default: false },
    parentsInfo: { type: Boolean, default: false },
    previousSchoolAndDocument: {
      previousSchoolDocument: { type: Boolean, default: false },
      aadharCard: { type: Boolean, default: false },
      identityDocument: { type: Boolean, default: false },
      casteCertificate: { type: Boolean, default: false },
      joiningTransferLetter: { type: Boolean, default: false },
      leavingTransferCertificate: { type: Boolean, default: false },
      incomeCertificate: { type: Boolean, default: false },
      lastYearMarksheet: { type: Boolean, default: false },
      nationalityCertificate: { type: Boolean, default: false },
      domicileCertificate: { type: Boolean, default: false },
      nonCreamyLayerCertificate: { type: Boolean, default: false },
    },
    bankDetails: { type: Boolean, default: false },
  },
  staff_category: {
    boyCount: { type: Number, default: 0 },
    girlCount: { type: Number, default: 0 },
    otherCount: { type: Number, default: 0 },
    generalCount: { type: Number, default: 0 },
    obcCount: { type: Number, default: 0 },
    scCount: { type: Number, default: 0 },
    stCount: { type: Number, default: 0 },
    ntaCount: { type: Number, default: 0 },
    ntbCount: { type: Number, default: 0 },
    ntcCount: { type: Number, default: 0 },
    ntdCount: { type: Number, default: 0 },
    vjCount: { type: Number, default: 0 },
  },
  lang_mode: {
    type: String,
    default: "en",
  },
  block_institute: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  blockedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteAdmin",
    },
  ],
  blockCount: {
    type: Number,
    default: 0,
  },
  export_staff_data: {
    personalInfo: { type: Boolean, default: true },
    otherPersonalInfo: { type: Boolean, default: false },
    identityDetails: { type: Boolean, default: false },
    addressInfo: { type: Boolean, default: false },
    previousSchoolAndDocument: {
      previousSchoolDocument: { type: Boolean, default: false },
      aadharCard: { type: Boolean, default: false },
      identityDocument: { type: Boolean, default: false },
      casteCertificate: { type: Boolean, default: false },
      joiningTransferLetter: { type: Boolean, default: false },
      leavingTransferCertificate: { type: Boolean, default: false },
      incomeCertificate: { type: Boolean, default: false },
      lastYearMarksheet: { type: Boolean, default: false },
      nationalityCertificate: { type: Boolean, default: false },
      domicileCertificate: { type: Boolean, default: false },
      nonCreamyLayerCertificate: { type: Boolean, default: false },
    },
    bankDetails: { type: Boolean, default: false },
  },
  export_student_data: {
    personalInfo: { type: Boolean, default: true },
    otherPersonalInfo: { type: Boolean, default: false },
    identityDetails: { type: Boolean, default: false },
    addressInfo: { type: Boolean, default: false },
    parentsInfo: { type: Boolean, default: false },
    previousSchoolAndDocument: {
      previousSchoolDocument: { type: Boolean, default: false },
      aadharCard: { type: Boolean, default: false },
      identityDocument: { type: Boolean, default: false },
      casteCertificate: { type: Boolean, default: false },
      joiningTransferLetter: { type: Boolean, default: false },
      leavingTransferCertificate: { type: Boolean, default: false },
      incomeCertificate: { type: Boolean, default: false },
      lastYearMarksheet: { type: Boolean, default: false },
      nationalityCertificate: { type: Boolean, default: false },
      domicileCertificate: { type: Boolean, default: false },
      nonCreamyLayerCertificate: { type: Boolean, default: false },
    },
    bankDetails: { type: Boolean, default: false },
  },
  next_date: {
    type: String,
  },
  payment_history: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderPayment",
    },
  ],
  affiliation_by: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ManageAdmin",
    },
  ],
  request_at: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ManageAdmin",
  },
  partial_pay_amount: {
    type: Number,
    default: 0,
  },
  razor_key: { type: String },
  razor_id: { type: String },
  razor_account: { type: Boolean, default: false },
  transportDepart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transport",
    },
  ],
  transportStatus: {
    type: String,
    default: "Disable",
  },
  gr_initials: {
    type: String,
  },
  application_fee_charges: {
    type: Number,
    default: 0,
  },
  total_application_amount: {
    type: Number,
    default: 0,
  },
  return_to_qviple: {
    type: Number,
    default: 0,
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
