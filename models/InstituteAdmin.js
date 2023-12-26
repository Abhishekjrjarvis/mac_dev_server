const mongoose = require("mongoose");

const instituteAdminSchema = new mongoose.Schema({
  insName: { type: String, required: true },
  name: { type: String, required: true, unique: true },
  insEmail: { type: String, required: true, unique: true },
  insPhoneNumber: { type: Number, required: true, maxlength: 10 },
  insMobileStatus: { type: String, default: "Not Verified" },
  insState: { type: String },
  insDistrict: { type: String },
  insPincode: { type: Number },
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
  UnApprovedStudent: [
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
  hostelCount: {
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
    experience: { type: Boolean, default: false}
  },
  studentFormSetting: {
    personalInfo: { type: Boolean, default: true },
    otherPersonalInfo: { type: Boolean, default: false },
    identityDetails: { type: Boolean, default: false },
    addressInfo: { type: Boolean, default: false },
    parentsInfo: { type: Boolean, default: false },
    enrollmentPrn: { type: Boolean, default: false },
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
    anti_ragging: { type: Boolean, default: false },
    id_card: { type: Boolean, default: false },
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
    enrollmentPrn: { type: Boolean, default: false },
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
    anti_ragging: { type: Boolean, default: false },
    id_card: { type: Boolean, default: false },
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
  eventManagerStatus: {
    type: String,
    default: "Disable",
  },
  eventManagerDepart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventManager",
    },
  ],
  excel_data_query: [
    {
      excel_file: { type: String },
      classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
      financeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Finance",
      },
      admissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admission",
      },
      instituteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstituteAdmin",
      },
      libraryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library",
      },
      subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
      flow: { type: String },
      status: { type: String, default: "Not Uploaded" },
      departId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
      },
    },
  ],
  careerStatus: {
    type: String,
    default: "Disable",
  },
  careerDepart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LandingCareer",
    },
  ],
  career_count: {
    type: Number,
    default: 0,
  },
  tenderStatus: {
    type: String,
    default: "Disable",
  },
  tenderDepart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LandingTender",
    },
  ],
  tender_count: {
    type: Number,
    default: 0,
  },
  website_looks: {
    logo: { type: String },
    background_image: { type: String },
    vision: { type: String },
    mission: { type: String },
    about: { type: String },
    color: { type: String },
    leading_person: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    leading_person_position: { type: String },
    leading_person_message: { type: String },
    linkedin_link: { type: String },
    instagram_link: { type: String },
    twitter_link: { type: String },
    qviple_link: { type: String },
  },
  website_active_tab: {
    home: { type: Boolean, default: true },
    about: { type: Boolean, default: true },
    department: { type: Boolean, default: true },
    contact_us: { type: Boolean, default: true },
    admission: { type: Boolean, default: false },
    library: { type: Boolean, default: false },
    announcements: { type: Boolean, default: false },
    events: { type: Boolean, default: false },
    tender: { type: Boolean, default: false },
    career: { type: Boolean, default: false },
    alumini: { type: Boolean, default: false },
    tpo_cell: { type: Boolean, default: false },
    rnd_cell: { type: Boolean, default: false },
    timetable: { type: Boolean, default: false },
    student_projects: { type: Boolean, default: false },
    student_articles: { type: Boolean, default: false },
  },
  contact_list: {
    address: { type: String },
    head_office_address: { type: String },
    about: { type: String },
    persons: [
      {
        department_name: { type: String },
        person_name: { type: String },
        person_phone_number: { type: String },
        person_email: { type: String },
      },
    ],
  },
  career_passage: {
    type: String,
  },
  tender_passage: {
    type: String,
  },
  aluminiStatus: {
    type: String,
    default: "Disable",
  },
  aluminiDepart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alumini",
    },
  ],
  sub_domain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubDomain",
  },
  sub_domain_link_up_status: {
    type: String,
    default: "Not Linked",
  },
  export_collection: [
    {
      excel_file: { type: String },
      excel_file_name: { type: String },
      created_at: { type: Date, default: Date.now },
      excel_val: { type: String },
    },
  ],
  export_collection_count: {
    type: Number,
    default: 0,
  },
  moderator_role: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinanceModerator",
    },
  ],
  moderator_role_count: {
    type: Number,
    default: 0,
  },
  original_copy: {
    type: Boolean,
    default: false,
  },
  hostelDepart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
    },
  ],
  hostelStatus: {
    type: String,
    default: "Disable",
  },
  invoice_count: {
    type: Number,
    default: 0,
  },
  payout_pool: {
    type: Number,
    default: 0,
  },
  bank_status: {
    type: String,
    default: "Primary",
  },
  online_amount_edit_access: {
    type: String,
    default: "Not Granted",
  },
  last_login: {
    type: Date,
  },
  profile_modification: {
    type: Date,
  },
  random_institute_code: {
    type: String,
  },
  pending_fee_custom_filter: {
    gender: {
      type: String,
    },
    cast_category: {
      type: String,
    },
    department: [],
    batch: [],
    master: [],
  },
  site_flash_notice: [
    {
      notice_title: { type: String },
      notice_image: { type: String },
      notice_button_name: { type: String },
      notice_button_link: { type: String },
    },
  ],
  affliatedLogo: {
    type: String,
  },
  alias_pronounciation: {
    student_alias: {
      type: String,
      default: "GRNO",
    },
    staff_alias: {
      type: String,
      default: "Index No.",
    },
  },
  merchant_options: {
    razor_pay: {
      type: Boolean,
      default: true,
    },
    paytm: {
      type: Boolean,
      default: true,
    },
  },
  un_approved_student_count: {
    type: Number,
    default: 0,
  },
  internal_query: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InternalQuery",
    },
  ],
  internal_query_count: {
    type: Number,
    default: 0,
  },
  student_section_form_show_query: {
    type: Boolean,
    default: true,
  },
  social_media_password_query: {
    type: String,
  },
  name_case_format_query: {
    type: String,
    default: "Normal",
  },
  invoice_count_array: [
    {
      year: {
        type: String,
      },
      last_count: {
        type: String,
      },
    },
  ],
  student_message: [
    {
      message: {
        type: String,
      },
      student_list: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
      ],
      created_at: {
        type: Date,
        default: Date.now,
      },
      student_list_count: {
        type: Number,
        default: 0,
      },
      message_type: {
        type: String,
      },
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
      from_name: {
        type: String,
      },
    },
  ],
  transport_linked_status: {
    type: String,
  },
  hostel_linked_status: {
    type: String,
  },
  academic_module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Academic",
  },
  nss_module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NSS"
  },
  authority: {
    type: String
  },
  authority_signature: {
    type: String
  },
  autority_stamp_profile: {
    type: String
  },
  certificate_fund_charges: {
    bona_charges: {
      type: Number,
      default: 0,
    },
    leaving_charges: {
      type: Number,
      default: 0,
    },
    transfer_charges: {
      type: Number,
      default: 0,
    },
    migration_charges: {
      type: Number,
      default: 0,
    },
  },
  certificate_issued_count: {
    type: Number,
    default: 0,
  },
  staff_leave_config: {
    casual_leave: {
      type: Number,
      default: 0
    },
    medical_leave: {
      type: Number,
      default: 0
    },
    sick_leave: {
      type: Number,
      default: 0
    }
  },
  c_off_leave: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave",
    },
  ],
  leave_config: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LeaveConfig"
  },
  facilities_module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Facilities"
  },
  student_export_collection: [
    {
      excel_file: { type: String },
      excel_file_name: { type: String },
      created_at: { type: Date, default: Date.now },
    },
  ],
  student_export_collection_count: {
    type: Number,
    default: 0,
  },
  naac_motto: {
    type: String
  },
  student_reminder: [
    {
      content: {
        type: String,
      },
      student_list: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
      ],
      created_at: {
        type: Date,
        default: Date.now,
      },
      student_list_count: {
        type: Number,
        default: 0,
      },
      content_type: {
        type: String,
      },
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
      from_name: {
        type: String,
      },
    },
  ],
  scholar_export_collection: [
    {
      excel_file: { type: String },
      excel_file_name: { type: String },
      created_at: { type: Date, default: Date.now },
    },
  ],
  scholar_export_collection_count: {
    type: Number,
    default: 0,
  },
  qviple_id: {
    type: String
  },
  institute_id_setting: {
    affiliated: String,
    name: String,
    address: String,
    institute_logo: String,
    affiliated_logo: String,
    issue_date: String,
    valid_date: String,
    authority_signature: String,
    institute_bg_cover: String,
  },
  moderator_list: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinanceModerator"
    }
  ]
});

// instituteAdminSchema.post("findOneAndDelete", async function (doc) {
//   if (doc) {
//     await Post.deleteMany({
//       _id: {
//         $in: doc.posts,
//       },
//     });
//   }
// });

const InstituteAdmin = mongoose.model("InstituteAdmin", instituteAdminSchema);

module.exports = InstituteAdmin;
