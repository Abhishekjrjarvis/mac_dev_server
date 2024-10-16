const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  staffCode: { type: String },
  staffProfilePhoto: { type: String },
  photoId: { type: String },
  staffFirstName: { type: String },
  staffMiddleName: { type: String },
  staffLastName: { type: String },
  staffDOB: { type: String },
  staffGender: { type: String },
  staffNationality: { type: String },
  staffMTongue: { type: String },
  staffMotherName: { type: String },
  staffCast: { type: String },
  staffCastCategory: { type: String },
  staffReligion: { type: String },
  staffBirthPlace: { type: String },
  staffBirthPlacePincode: { type: String },
  staffBirthPlaceState: { type: String },
  staffBirthPlaceDistrict: { type: String },
  staffDistrict: { type: String },
  staffPincode: { type: String },
  staffState: { type: String },
  staffAddress: { type: String },
  staffCurrentPincode: { type: String },
  staffCurrentDistrict: { type: String },
  staffCurrentState: { type: String },
  staffCurrentAddress: { type: String },
  staffPhoneNumber: { type: Number },
  staffAadharNumber: { type: String },
  staffQualification: { type: String },
  staffAadharFrontCard: { type: String },
  staffAadharBackCard: { type: String },
  staffPreviousSchool: { type: String },
  staffBankName: { type: String },
  staffBankAccount: { type: String },
  staffBankAccountHolderName: { type: String },
  staffBankIfsc: { type: String },
  staffBankPassbook: { type: String },
  staffCasteCertificatePhoto: { type: String },
  staffPanNumber: { type: String },
  staffDocuments: [
    {
      documentName: {
        type: String,
      },
      documentKey: {
        type: String,
      },
      documentType: {
        type: String,
      },
    },
  ],
  staffStatus: { type: String, default: "Not Approved" },
  staffROLLNO: { type: String },
  staffDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
  previousStaffDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
  staffClass: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
  previousStaffClass: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
  staffSubject: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
  previousStaffSubject: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  batches: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  attendDates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StaffAttendenceDate",
    },
  ],
  financeDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Finance",
    },
  ],
  sportDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
    },
  ],
  staffSportClass: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportClass",
    },
  ],
  staffLeave: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave",
    },
  ],
  staffTransfer: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transfer",
    },
  ],
  joinedInsGroup: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GroupConversation",
    },
  ],
  elearning: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ELearning",
    },
  ],
  library: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
    },
  ],
  admissionDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admission",
    },
  ],
  admissionModeratorDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionModerator",
    },
  ],
  financeModeratorDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinanceModerator",
    },
  ],
  instituteModeratorDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinanceModerator",
    },
  ],
  hostelModeratorDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionModerator",
    },
  ],
  isAdmin: {
    type: Boolean,
    default: false,
  },
  chatAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteChat",
  },
  joinChat: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteChat",
    },
  ],
  staffJoinDate: {
    type: String,
  },
  staffApplyDate: {
    type: String,
  },
  staffDesignationCount: {
    type: Number,
    default: 0,
  },
  recentDesignation: {
    type: String,
  },

  complaints: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StaffComplaint",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  salary_history: [
    {
      salary: { type: Number, default: 0 },
      month: { type: String },
      pay_mode: { type: String },
      emp_pay: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payroll",
      },
    },
  ],
  staff_biometric_id: { type: String },
  transportDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transport",
    },
  ],
  vehicle: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
  ],
  vehicle_category: {
    type: String,
  },
  permission: {
    admission: [],
    finance: [],
  },
  mentorDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
    },
  ],
  eventManagerDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventManager",
    },
  ],
  aluminiDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alumini",
    },
  ],
  designation_array: [
    {
      role: { type: String },
      role_id: { type: String },
    },
  ],
  hostelDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
    },
  ],
  hostelUnitDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HostelUnit",
    },
  ],
  //////////////////
  previousFinanceDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Finance",
    },
  ],
  previousLibrary: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
    },
  ],
  previousAdmissionDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admission",
    },
  ],

  previousAdmissionModerator: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionModerator",
    },
  ],
  previousFinanceModerator: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinanceModerator",
    },
  ],
  previousInstituteModerator: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinanceModerator",
    },
  ],
  previousHostelModerator: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdmissionModerator",
    },
  ],

  previousTransportDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transport",
    },
  ],
  previousVehicle: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
  ],
  previousMentor: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
    },
  ],
  previousEventManager: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventManager",
    },
  ],
  previousAlumini: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alumini",
    },
  ],
  previousHostel: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
    },
  ],
  previousHostelUnit: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HostelUnit",
    },
  ],
  staff_replacement: {
    type: String,
    default: "Not Transfer",
  },
  active_designation: {
    flow: {
      type: String,
      default: "None",
    },
    flow_id: {
      type: String,
    },
  },
  staffBatch: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
  ],
  experience: [
    {
      college_name: { type: String },
      college_year: { type: String },
      course_field: { type: String },
    },
  ],
  student_message: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentMessage",
    },
  ],
  student_message_count: {
    type: Number,
    default: 0,
  },
  casual_leave: {
    type: Number,
    default: 0,
  },
  medical_leave: {
    type: Number,
    default: 0,
  },
  sick_leave: {
    type: Number,
    default: 0,
  },
  off_duty_leave: {
    type: Number,
    default: 0,
  },
  c_off_leave: {
    type: Number,
    default: 0,
  },
  lwp_leave: {
    type: Number,
    default: 0,
  },
  leave_taken: {
    type: Number,
    default: 0,
  },
  commuted_leave: {
    type: Number,
    default: 0,
  },
  maternity_leave: {
    type: Number,
    default: 0,
  },
  paternity_leave: {
    type: Number,
    default: 0,
  },
  study_leave: {
    type: Number,
    default: 0,
  },
  half_pay_leave: {
    type: Number,
    default: 0,
  },
  quarantine_leave: {
    type: Number,
    default: 0,
  },
  sabbatical_leave: {
    type: Number,
    default: 0,
  },
  special_disability_leave: {
    type: Number,
    default: 0,
  },
  winter_vacation_leave: {
    type: Number,
    default: 0,
  },
  summer_vacation_leave: {
    type: Number,
    default: 0,
  },
  child_adoption_leave: {
    type: Number,
    default: 0,
  },
  bereavement_leave: {
    type: Number,
    default: 0,
  },
  earned_leave: {
    type: Number,
    default: 0,
  },
  recommend_authority: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FinanceModerator",
  },
  review_authority: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FinanceModerator",
  },
  sanction_authority: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FinanceModerator",
  },
  current_designation: {
    type: String,
  },
  member_module_unique: {
    type: String,
    unique: true,
  },
  teaching_type: {
    type: String,
  },
  borrow: [{ type: mongoose.Schema.Types.ObjectId, ref: "IssueBook" }],
  deposite: [{ type: mongoose.Schema.Types.ObjectId, ref: "CollectBook" }],
  staff_pf_number: {
    type: String,
  },
  library_qr_code: String,
  library_in_out: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LibraryInOut",
    },
  ],
  libraryModeratorDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LibraryModerator",
    },
  ],
  lms_department: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LMS",
    },
  ],
  staff_emp_code: {
    type: String,
  },
  student_feedback: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StaffStudentFeedback",
    },
  ],
  library_total_time_spent: {
    hours: {
      type: Number,
      default: 0,
    },
    minutes: {
      type: Number,
      default: 0,
    },
    seconds: {
      type: Number,
      default: 0,
    },
  },
  stores_department: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InventoryStore",
    },
  ],
  goods_register: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GoodManager",
    },
  ],
  request: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RequestGoods",
    },
  ],
  issue: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IssueGoods",
    },
  ],
  return: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReturnGoods",
    },
  ],
  consume: [],
  stock_take: [],
  register: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StoreLogs",
    },
  ],
  maintanence: [],
  payrollDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PayrollModule",
    },
  ],
  salary_structure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SalaryStructure",
  },
  staff_grant_status: {
    type: String,
  },
  staff_position: {
    type: String,
  },
  staff_technicality: {
    type: String,
  },
  pay_slip: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaySlip",
    },
  ],
  salary_days: [
    {
      total_working_days: { type: Number, default: 0 },
      present: { type: Number, default: 0 },
      paid_leaves: { type: Number, default: 0 },
      unpaid_leaves: { type: Number, default: 0 },
      absent: { type: Number, default: 0 },
      holiday: { type: Number, default: 0 },
      month: { type: String },
      year: { type: String },
    },
  ],
  staff_holiday: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StaffHoliday",
    },
  ],
  head_data: {
    key: {
      type: String,
    },
    value: {
      type: String,
    },
  },
  choose_tax_regime: {
    type: String,
  },
  tds_calculation: {
    income_from_sal: {
      actual_rent: { type: Number, default: 0 },
      other_allowances: { type: Number, default: 0 },
      salary_from_other: { type: Number, default: 0 },
    },
    income_from_house: {
      income_from_hp: { type: Number, default: 0 },
      municiple_tax_paid: { type: Number, default: 0 },
      interest_self: { type: Number, default: 0 },
      interest_let_out: { type: Number, default: 0 },
    },
    income_from_os: {
      income_from_other: { type: Number, default: 0 },
    },
    deductions: {
      Sec_80C_80CCC_80CCD: { type: Number, default: 0 },
      Sec_80D: { type: Number, default: 0 },
      Sec_80G: { type: Number, default: 0 },
      Sec_80GG: { type: Number, default: 0 },
      Sec_80TTA: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    tds_calculate: {
      rate: { type: String },
      month: { type: Number, default: 0 },
      annual: { type: Number, default: 0 },
    },
  },
  financial_data: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TDSFinance",
    },
  ],
  monthly_heads_data: [
    {
      month: { type: String },
      heads_key: { type: String },
      year: { type: String },
      price: { type: Number, default: 0 },
      section: { type: String },
    },
  ],
  form_16: {
    annual: { type: String },
    key_a: { type: String },
  },
  staff_obj: {
    key: { type: String },
    value: { type: Number, default: 0 },
    slip: { type: String },
    slip_key: { type: String, default: "PaymentSlip (1).pdf" },
  },
  iqacDepartment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IQAC",
    },
  ],
  custom_authority: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomAuthority",
    },
  ],
  staff_joining_letter: { type: String },
  staffAlternatePhoneNumber: { type: String },
  staffAlternateEmail: { type: String },
  staffEmail: { type: String },
  staff_qualification_details: [],
  staff_past_experience_details: [],
  staff_research_and_publication: [],
  yt_links: { type: String },
  fb_links: { type: String },
  tw_links: { type: String },
  ig_links: { type: String },
  in_links: { type: String },
  qviple_links: { type: String },
  staff_dynamic_field: [
    {
      key: { type: String },
      value: { type: String },
    },
  ],
  staff_department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  staff_blood_group: { type: String },
  staff_self_intro: { type: String },
  activity: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
    },
  ],
  projects: [
    {
      srn: { type: String },
      title: { type: String },
      student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      classes: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
      department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
      subject: { type: String },
      guide_name: { type: String },
      link: { type: String },
      attach: { type: String },
      abstract: { type: String },
    },
  ],
  qviple_staff_pay_id: {
    type: String,
  },
  guide: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guide",
    },
  ],
  guide_count: {
    type: Number,
    default: 0,
  },
  inward_outward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InwardOutwardStaff",
  },
  inward_outward_signature: {
    type: String,
  },

  taken_leave: {
    casual_leave: {
      type: Number,
      default: 0,
    },
    medical_leave: {
      type: Number,
      default: 0,
    },
    sick_leave: {
      type: Number,
      default: 0,
    },
    off_duty_leave: {
      type: Number,
      default: 0,
    },
    c_off_leave: {
      type: Number,
      default: 0,
    },
    lwp_leave: {
      type: Number,
      default: 0,
    },
    leave_taken: {
      type: Number,
      default: 0,
    },
    commuted_leave: {
      type: Number,
      default: 0,
    },
    maternity_leave: {
      type: Number,
      default: 0,
    },
    paternity_leave: {
      type: Number,
      default: 0,
    },
    study_leave: {
      type: Number,
      default: 0,
    },
    half_pay_leave: {
      type: Number,
      default: 0,
    },
    quarantine_leave: {
      type: Number,
      default: 0,
    },
    sabbatical_leave: {
      type: Number,
      default: 0,
    },
    special_disability_leave: {
      type: Number,
      default: 0,
    },
    winter_vacation_leave: {
      type: Number,
      default: 0,
    },
    summer_vacation_leave: {
      type: Number,
      default: 0,
    },
    child_adoption_leave: {
      type: Number,
      default: 0,
    },
    bereavement_leave: {
      type: Number,
      default: 0,
    },
    earned_leave: {
      type: Number,
      default: 0,
    },
  },
});

const Staff = mongoose.model("Staff", staffSchema);

module.exports = Staff;
