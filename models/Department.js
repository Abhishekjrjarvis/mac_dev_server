const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  dName: { type: String, required: true },
  dTitle: { type: String, required: true },
  dEmail: { type: String },
  dPhoneNumber: { type: Number, minlength: 10 },
  dOperatingAdmin: { type: String },
  dStudentRepr: { type: String },
  dVision: { type: String },
  dMission: { type: String },
  dAbout: { type: String },
  dStaffTotal: { type: Number },
  dStudentTotal: { type: Number },
  dAwards: { type: String },
  dSpeaker: { type: String },
  dStudentPresident: { type: String },
  dAdminClerk: { type: String },
  dVicePrinciple: { type: String },
  photoId: { type: String, default: "1" },
  photo: { type: String },
  coverId: { type: String, default: "2" },
  cover: { type: String },
  departmentClassMasters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassMaster",
    },
  ],
  departmentSubjectMasters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMaster",
    },
  ],

  departmentSelectBatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  userBatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  dHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  batches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
  ],
  exams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
  ],
  checklists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checklist",
    },
  ],
  fees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  departmentChatGroup: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
  ],

  holiday: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Holiday",
    },
  ],
  class: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
  ApproveStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  UnApproveStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  studentComplaint: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
  ],
  idCardField: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Field",
    },
  ],
  classMasterCount: {
    type: Number,
    default: 0,
  },
  subjectMasterCount: {
    type: Number,
    default: 0,
  },
  classCount: {
    type: Number,
    default: 0,
  },
  batchCount: {
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
  displayPersonList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DisplayPerson",
    },
  ],
  activeTimeDayWise: [
    {
      day: String,
      from: String,
      to: String,
      half: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  activeTimeDateWise: [
    {
      day: String,
      date: {
        type: Date,
      },
      from: String,
      to: String,
      half: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  election_event: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
    },
  ],
  election_event_count: {
    type: Number,
    default: 0,
  },
  participate_event: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participate",
    },
  ],
  participate_event_count: {
    type: Number,
    default: 0,
  },
  onlineFee: {
    type: Number,
    default: 0,
  },
  election_date_setting: {
    end_date: { type: Number, default: 3 },
    select_date: { type: Number, default: 2 },
    campaign_date: { type: Number, default: 1 },
    campaign_last_date: { type: Number, default: 6 },
    vote_date: { type: Number, default: 1 },
    result_date: { type: Number, default: 1 },
  },
  fees_structures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStructure",
    },
  ],
  fees_structures_count: {
    type: Number,
    default: 0,
  },
  modify_fees_structures_count: {
    type: Number,
    default: 0,
  },
  mentor: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
    },
  ],
  mentor_count: {
    type: Number,
    default: 0,
  },
  mentees_count: {
    type: Number,
    default: 0,
  },
  query: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queries",
    },
  ],
  query_count: {
    type: Number,
    default: 0,
  },
  feed_question: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeedQuestion",
    },
  ],
  feed_question_count: {
    type: Number,
    default: 0,
  },
  take_feedback: [
    {
      create_on: { type: Date },
      created_at: { type: Date, default: Date.now },
      total_feed: { type: Number, default: 0 },
      collect_feed: { type: Number, default: 0 },
      mentors: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Mentor",
        },
      ],
    },
  ],
  take_feedback_count: {
    type: Number,
    default: 0,
  },
  next_feed_back: {
    type: Date,
  },
  events: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
    },
  ],
  events_count: {
    type: Number,
    default: 0,
  },
  seminars: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seminar",
    },
  ],
  seminars_count: {
    type: Number,
    default: 0,
  },
  site_info: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DepartmentSite",
    },
  ],
  bank_account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankAccount",
  },
  malicicous: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamMalicious",
    },
  ],
  grade_system: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GradeSystem",
    },
  ],
  exam_fee_structure: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamFeeStructure",
    },
  ],
  exam_fee_structure_count: {
    type: Number,
    default: 0,
  },
  gr_initials: {
    type: String,
  },
  due_repay: {
    type: Number,
    default: 0,
  },
  total_repay: {
    type: Number,
    default: 0,
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
    gate_score: { type: Boolean, default: false },
    marks_and_degree_score: { type: Boolean, default: false },
    anti_ragging: { type: Boolean, default: false },
    id_card: { type: Boolean, default: false },
  },
  ug_undertakings_admission: {
    type: Boolean,
    default: false,
  },
  pg_undertakings_admission: {
    type: Boolean,
    default: false,
  },
  exam_weight_left: {
    type: Number,
    default: 100,
  },
  internal_assesment: {
    type: Number,
    default: 0,
  },
  external_assesment: {
    type: Number,
    default: 0,
  },
  member_module_unique: {
    type: String,
    unique: true,
  },
  po_attainment_count: {
    type: Number,
    default: 0,
  },
  po_attainment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attainment",
    },
  ],
  last_update: {
    type: Date,
  },
  course_passing_credit: {
    type: Number,
  },
  department_programme_name: {
    type: String,
  },
  request: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RequestGoods",
    },
  ],
  institute_type: {
    type: String,
  },
  institute_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteType",
  },
  affiliation_with_institute: {
    type: String,
  },
  affiliation_with_institute_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University",
  },
  department_type: {
    type: String,
  },
  department_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DepartmentType",
  },
  stream_type: {
    type: String,
  },
  stream_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StreamType",
  },
  academic_start_date: {
    type: Date,
  },
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
  student_form_setting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DepartmentStudentForm",
  },
  pin_status: {
    type: String,
  },
  pin_status_id: {
    type: String,
  },
  pin_status_flow: {
    type: String,
  },
  department_status: {
    type: String,
    default: "Normal",
  },
  merged_subject_master: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMaster",
    },
  ],
  mou_collab: [
    {
      srn: { type: String },
      org_name: { type: String },
      institution_industry: { type: String },
      durations: { type: String },
      link: { type: String },
      attach: { type: String },
      batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
      activities: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
      },
      student_count: {
        type: Number,
        default: 0,
      },
      staff_count: {
        type: Number,
        default: 0,
      },
    },
  ],
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
  hall_ticket: [
    {
      name: { type: String },
      attach: { type: String },
    },
  ],
  active_academic_batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  filter_application: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewApplication",
    },
  ],
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
  // office_start_hr: {
  //   type: String,
  // },
  // office_end_hr: {
  //   type: String,
  // },
  late_mark: {
    intime: String,
    outtime: String,
    intime_concession: String,
    outtime_concession: String,
    halfday: String,
  },
});

const Department = mongoose.model("Department", departmentSchema);

module.exports = Department;
