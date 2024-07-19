const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentCode: { type: String },
  studentProfilePhoto: { type: String },
  photoId: { type: String },
  studentFirstName: { type: String },
  studentMiddleName: { type: String },
  studentLastName: { type: String },
  studentDOB: { type: String },
  studentGender: { type: String },
  studentNationality: { type: String },
  studentMTongue: { type: String },
  studentMotherName: { type: String },
  studentCast: { type: String },
  studentCastCategory: { type: String },
  studentReligion: { type: String },
  studentBirthPlace: { type: String },
  studentBirthPlacePincode: { type: String },
  studentBirthPlaceState: { type: String },
  studentBirthPlaceDistrict: { type: String },
  studentBookNo: { type: String },
  studentDistrict: { type: String },
  studentPincode: { type: String },
  studentState: { type: String },
  studentAddress: { type: String },
  studentCurrentPincode: { type: String },
  studentCurrentDistrict: { type: String },
  studentCurrentState: { type: String },
  studentCurrentAddress: { type: String },
  studentPhoneNumber: { type: Number },
  studentAadharNumber: { type: String },
  studentParentsName: { type: String },
  studentParentsPhoneNumber: { type: Number },
  studentFatherRationCardColor: { type: String },
  studentParentsOccupation: { type: String },
  studentParentsAnnualIncom: { type: String },
  studentAadharFrontCard: { type: String },
  studentAadharBackCard: { type: String },
  studentPreviousSchool: { type: String },
  studentBankName: { type: String },
  studentBankAccount: { type: String },
  studentBankAccountHolderName: { type: String },
  studentBankIfsc: { type: String },
  studentBankPassbook: { type: String },
  studentCasteCertificatePhoto: { type: String },
  studentUidaiNumber: { type: String },
  studentDocuments: [
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
  studentOptionalSubject: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
  studentCertificateNo: { type: String },
  studentStatus: { type: String, default: "Not Approved" },
  studentPremoteStatus: { type: String, default: "Not Promoted" },
  studentReason: { type: String },
  studentCertificateDate: { type: String },
  studentLeavingInsDate: { type: String },
  studentLeavingRemark: { type: String },
  studentBookNo: { type: String },
  studentROLLNO: { type: String },
  studentGRNO: { type: String },
  studentLeavingBehaviour: { type: String },
  studentLeavingStudy: { type: String },
  studentLeavingReason: { type: String },
  studentLeavingPrevious: { type: String },
  studentLeavingStatus: { type: String, default: "Not Ready" },
  studentBonaStatus: { type: String, default: "Not Ready" },
  studentClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  notification: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentNotification",
    },
  ],
  studentBehaviour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Behaviour",
  },
  subjectMarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMarks",
    },
  ],
  exams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
  ],

  finalReportStatus: { type: String, default: "No" },
  finalReport: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinalReport",
    },
  ],

  testSet: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentTestSet",
    },
  ],

  assignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentAssignment",
    },
  ],
  totalAssignment: {
    type: Number,
    default: 0,
  },
  submittedAssignment: {
    type: Number,
    default: 0,
  },
  incompletedAssignment: {
    type: Number,
    default: 0,
  },
  completedAssignment: {
    type: Number,
    default: 0,
  },

  previousYearData: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentPreviousData",
    },
  ],

  studentFee: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  attendDate: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendenceDate",
    },
  ],

  allottedChecklist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checklist",
    },
  ],
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  onlineFeeList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  onlineCheckList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Checklist",
    },
  ],
  offlineFeeList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  sportClass: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportClass",
    },
  ],
  sportTeam: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportTeam",
    },
  ],
  extraPoints: {
    type: Number,
    default: 0,
  },
  sportEvent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SportEvent",
    },
  ],
  studentSportsEventMatch: [
    {
      eventMatch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SportEventMatch",
      },
      rankTitle: { type: String, default: "Announced to be soon" },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
  complaints: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
    },
  ],
  batches: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  batchCount: {
    type: Number,
    default: 0,
  },
  leave: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentLeave",
    },
  ],
  transfer: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentTransfer",
    },
  ],
  studentExemptFee: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  exemptFeeList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fees",
    },
  ],
  studentRemainingFeeCount: {
    type: Number,
    default: 0,
  },
  studentPaidFeeCount: {
    type: Number,
    default: 0,
  },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Library",
  },
  studentAdmissionDate: {
    type: String,
  },
  borrow: [{ type: mongoose.Schema.Types.ObjectId, ref: "IssueBook" }],
  deposite: [{ type: mongoose.Schema.Types.ObjectId, ref: "CollectBook" }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sportEventCount: {
    type: Number,
    default: 0,
  },
  admissionRemainFeeCount: {
    type: Number,
    default: 0,
  },
  admissionPaidFeeCount: {
    type: Number,
    default: 0,
  },
  paidFeeList: [
    {
      paidAmount: { type: Number, default: 0 },
      appId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
    },
  ],
  refundAdmission: [
    {
      refund_status: { type: String, default: "No Refund" },
      refund_reason: { type: String },
      refund_amount: { type: Number, default: 0 },
      refund_on: { type: Date, default: Date.now },
      refund_from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication",
      },
    },
  ],
  remainingFeeList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RemainingList",
    },
  ],
  remainingFeeList_count: {
    type: Number,
    default: 0,
  },
  fee_structure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeStructure",
  },
  hostel_fee_structure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeStructure",
  },
  hostel_fee_structure_month: {
    type: Number,
    default: 0,
  },
  hostel_renewal: {
    type: Date,
  },
  hostelRemainFeeCount: {
    type: Number,
    default: 0,
  },
  hostelPaidFeeCount: {
    type: Number,
    default: 0,
  },
  active_fee_heads: [
    {
      appId: { type: mongoose.Schema.Types.ObjectId, ref: "NewApplication" },
      vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
      },
      head_name: { type: String },
      created_at: { type: Date, default: Date.now },
      applicable_fee: { type: Number, default: 0 },
      remain_fee: { type: Number, default: 0 },
      paid_fee: { type: Number, default: 0 },
      fee_structure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeStructure",
      },
      master: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeMaster",
      },
      original_paid: { type: Number, default: 0 },
      is_society: { type: Boolean, default: false }
    },
  ],
  certificateBonaFideCopy: {
    trueCopy: { type: Boolean, default: false },
    secondCopy: { type: Boolean, default: false },
    thirdCopy: { type: Boolean, default: false },
  },
  certificateLeavingCopy: {
    trueCopy: { type: Boolean, default: false },
    secondCopy: { type: Boolean, default: false },
    thirdCopy: { type: Boolean, default: false },
    originalCopy: { type: Boolean, default: false },
  },

  dailyUpdate: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectUpdate",
    },
  ],
  student_biometric_id: { type: String },
  election_candidate: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election",
    },
  ],
  participate_event: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participate",
    },
  ],
  checkList_participate_event: [],
  participate_result: [
    {
      event: { type: mongoose.Schema.Types.ObjectId, ref: "Participate" },
      rank: { type: String },
      created_at: { type: Date, default: Date.now },
    },
  ],
  backlog: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Backlog",
    },
  ],
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vehicle",
  },
  transport_fee_structure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeStructure",
  },
  vehicleRemainFeeCount: {
    type: Number,
    default: 0,
  },
  vehiclePaidFeeCount: {
    type: Number,
    default: 0,
  },
  vehicle_payment_status: [
    {
      vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
      status: { type: String, default: "Not Paid" },
      created_at: { type: Date, default: Date.now },
      amount: { type: Number, default: 0 },
    },
  ],
  routes: [
    {
      routeId: { type: String },
      routePath: { type: String },
      routeStructure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeStructure",
      },
      vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
      },
    },
  ],
  active_routes: {
    type: String,
  },
  active_status: [],
  student_prn_enroll_number: {
    type: String,
  },
  query_count: {
    type: Number,
    default: 0,
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Mentor",
  },
  queries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queries",
    },
  ],
  total_query: {
    type: Number,
    default: 0,
  },
  feed_back_count: {
    type: Number,
    default: 0,
  },
  deposit_pending_amount: {
    type: Number,
    default: 0,
  },
  deposit_refund_amount: {
    type: Number,
    default: 0,
  },
  refund_deposit: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeReceipt",
    },
  ],
  form_status: {
    type: String,
    default: "Not Filled",
  },
  fee_receipt: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeReceipt",
    },
  ],
  student_bed_number: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HostelBed",
  },
  student_unit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HostelUnit",
  },
  student_renewal: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Renewal",
    },
  ],
  announcements: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InsAnnouncement",
    },
  ],

  duplicate_copy: {
    type: String,
    default: "Original Copy",
  },

  previous_transport_history: [
    {
      batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch" },
      vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
      },
      vehicleRemainFeeCount: {
        type: Number,
        default: 0,
      },
      vehiclePaidFeeCount: {
        type: Number,
        default: 0,
      },
      vehicle_payment_status: [
        {
          vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
          status: { type: String, default: "Not Paid" },
          created_at: { type: Date, default: Date.now },
          amount: { type: Number, default: 0 },
        },
      ],
    },
  ],
  subjectAttendance: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendenceDate",
    },
  ],
  backlog_exam_fee: [
    {
      reason: { type: String },
      created_at: { type: Date, default: Date.now },
      amount: { type: Number, default: 0 },
      status: { type: String, default: "Not paid" },
      card_on: { type: String, default: "Backlog Fees" },
      exam_structure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExamFeeStructure",
      },
    },
  ],
  internal_fees_query: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InternalFees",
    },
  ],
  mentor_assign_query: [
    {
      classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
      status: {
        type: String,
        default: "Not Assigned",
      },
      created_at: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  libraryFineRemainCount: {
    type: Number,
    default: 0,
  },
  libraryFinePaidCount: {
    type: Number,
    default: 0,
  },
  applicable_fees_pending: {
    type: Number,
    default: 0,
  },
  government_fees_pending: {
    type: Number,
    default: 0
  },
  valid_full_name: {
    type: String,
  },
  exist_linked_hostel: {
    status: {
      type: String,
      default: "Not Linked",
    },
    exist_student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  },
  online_amount_edit_access: {
    type: String,
    default: "Not Granted",
  },
  pay_as_a_guest: {
    type: String,
    default: "Not Guested",
  },
  application_print: [
    {
      created_at: {
        type: Date,
        default: Date.now,
      },
      flow: { type: String },
      value: { type: String },
      from: { type: String },
    },
  ],
  student_bona_message: {
    type: String,
  },
  studentEmail: {
    type: String,
  },
  you_default: {
    type: Boolean,
    default: false,
  },
  student_gate_score: {
    type: String,
  },
  student_gate_year: {
    type: String,
  },
  student_degree_institute: {
    type: String,
  },
  student_degree_year: {
    type: String,
  },
  student_pre_sem_obtained_points: {
    type: String,
  },
  student_percentage_cpi: {
    type: String,
  },
  student_pre_sem_total_points: {
    type: String,
  },
  student_final_sem_total_points: {
    type: String,
  },
  student_final_sem_obtained_points: {
    type: String,
  },
  student_hostel_cpi: {
    type: String,
  },
  student_programme: {
    type: String,
  },
  student_branch: {
    type: String,
  },
  student_year: {
    type: String,
  },
  student_single_seater_room: {
    type: String,
  },
  student_ph: {
    type: String,
  },
  student_ph_type: {
    type: String,
  },
  query_lock_status: {
    type: String,
    default: "Unlocked",
  },
  class_selected_batch: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },
  ],
  student_blood_group: {
    type: String,
  },
  student_join_mode: {
    type: String,
  },
  old_fee_structure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeStructure",
  },
  student_anti_ragging: {
    type: String,
  },
  student_anti_ragging_parents: {
    type: String
  },
  student_id_card_front: {
    type: String,
  },
  student_id_card_back: {
    type: String,
  },
  profile_percentage: {
    type: Number,
    default: 0,
  },
  student_abc_id: {
    type: String,
  },
  certificate: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CertificateQuery",
    },
  ],
  certificate_count: {
    type: Number,
    default: 0,
  },
  member_module_unique: {
    type: String,
    unique: true
  },
  total_paid_fees: {
    type: Number,
    default: 0
  },
  total_os_fees: {
    type: Number,
    default: 0
  },
  applicable_os_fees: {
    type: Number,
    default: 0
  },
  government_os_fees: {
    type: Number,
    default: 0
  },
  offline_collect_admission_query: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RemainingList"
    }
  ],
  admission_amount_stats: {
    total_fees: {
      type: Number,
      default: 0
    },
    total_paid_fees: {
      type: Number,
      default: 0
    },
    total_os_fees: {
      type: Number,
      default: 0
    },
    total_app_fees: {
      type: Number,
      default: 0
    },
    total_app_paid_fees: {
      type: Number,
      default: 0
    },
    total_app_os_fees: {
      type: Number,
      default: 0
    },
    total_gov_fees: {
      type: Number,
      default: 0
    },
    total_gov_paid_fees: {
      type: Number,
      default: 0
    },
    total_gov_os_fees: {
      type: Number,
      default: 0
    },
  },
  promote_with_backlog: [
    {
      backlog_credit: Number,
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
      class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    },
  ],
  promote_with_backlog: [
    {
      backlog_credit: Number,
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
      class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    },
  ],
  promote_with_backlog_credit: {
    type: Number,
    default: 0,
  },
  promote_with_pass: [
    {
      resultStatus: String,
      class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    },
  ],
  studentCertificatePaidAmount: {
    type: Number,
    default: 0
  },
  library_qr_code: String,
  library_in_out: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LibraryInOut",
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
  refund: {
    type: Number,
    default: 0
  },
  leaving_date: {
    type: String
  },
  instituteJoinDate: {
    type: String
  },
  leaving_degree: {
    type: String
  },
  leaving_since_date: {
    type: String
  },
  leaving_course_duration: {
    type: String
  },
  elective_subject_one: {
    type: String
  },
  elective_subject_second: {
    type: String
  },
  leaving_project_work: {
    type: String
  },
  leaving_guide_name: {
    type: String
  },
  lcRegNo: {
    type: String
  },
  lcCaste: {
    type: String
  },
  lcBirth: {
    type: String
  },
  lcDOB: {
    type: String
  },
  lcAdmissionDate: {
    type: String
  },
  lcInstituteDate: {
    type: String
  },
  studentFatherName: { type: String },
  studentNameAsMarksheet: { type: String },
  studentNameAsCertificate: { type: String },
  studentIdProfilePhoto: { type: String },
  studentParentsEmail: { type: String },
  studentParentsAddress: { type: String },
  student_seat_type: { type: String },
  student_defence_personnel_word: { type: String },
  student_marital_status: { type: String },
  student_board_university: { type: String },
  student_previous_institute_name: { type: String },
  student_university_courses: { type: String },
  student_previous_class: { type: String },
  student_previous_marks: { type: String },
  student_previous_percentage: { type: String },
  student_previous_section: { type: String },
  student_previous_lctc: { type: String },
  student_previous_marksheet_attachment: { type: String },
  student_undertakings: { type: String },
  student_anti_ragging: { type: String },
  student_signature: { type: String },
  student_parents_signature: { type: String },
  student_pan_card: { type: String },
  student_ration_card: { type: String },
  university_eligibility_form: { type: String },
  ph_certificate: { type: String },
  gap_certificate: { type: String },
  eligibilty_certificate: { type: String },
  caste_certificate: { type: String },
  domicileCertificate: { type: String },
  nationalityCertificate: { type: String },
  nonCreamyLayerCertificate: { type: String },
  migrationCertificate: { type: String },
  migrationCertificate_other: { type: String },
  incomeCertificate: { type: String },
  student_dynamic_field: [
    {
      key: { type: String },
      value: { type: String }
    }
  ],
  student_form_flow: {
    flow: { type: String },
    did: { type: String }
  },
  fee_category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FeeCategory"
  },
  active_society_fee_heads: [],
  leaving_student_name: String,
  leaving_nationality: String,
  leaving_religion: String,
  leaving_previous_school: String,
  leaving_certificate_attach: String,
  student_optional_subject: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMaster"
    }
  ],
  student_optional_subject_access: {
    type: String,
    default: "No"
  },
  major_subject: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMaster"
    }
  ],
  nested_subject: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMaster"
    }
  ],
  std_tenth_details: {
    type: String
  },
  month_of_passing: { type: String },
  year_of_passing: { type: String },
  percentage: { type: String },
  name_of_institute: { type: String },
  hsc_diploma: {
    type: String
  },
  hsc_month: { type: String },
  hsc_year: { type: String },
  hsc_percentage: { type: String },
  hsc_name_of_institute: { type: String },
  hsc_board: { type: String },
  hsc_candidate_type: { type: String },
  hsc_vocational_type: { type: String },
  hsc_physics_marks: { type: String },
  hsc_chemistry_marks: { type: String },
  hsc_mathematics_marks: { type: String },
  hsc_pcm_total: { type: String },
  hsc_grand_total: { type: String },
  ug_engineering: {
    type: String
  },
  pre_final_sem: { type: String },
  pre_marks_credit_obtain: { type: String },
  pre_total_grade_points: { type: String },
  final_sem: { type: String },
  final_marks_credit_obtain: { type: String },
  final_total_grade_points: { type: String },
  final_cpi: { type: String },
  entrance_exam: { type: String },
  jee_details: { type: String },
  jee_rollno: { type: String },
  jee_physics_marks: { type: String },
  jee_chemistry_marks: { type: String },
  jee_mathematics_marks: { type: String },
  jee_total: { type: String },
  jee_percentile: { type: String },
  cet_details: { type: String },
  cet_rollno: { type: String },
  cet_physics_marks: { type: String },
  cet_chemistry_marks: { type: String },
  cet_mathematics_marks: { type: String },
  cet_biology_marks: { type: String },
  cet_total: { type: String },
  cet_percentile: { type: String },
  aieee_details: { type: String },
  aieee_rollno: { type: String },
  aieee_physics_marks: { type: String },
  aieee_chemistry_marks: { type: String },
  aieee_mathematics_marks: { type: String },
  aieee_biology_marks: { type: String },
  aieee_total: { type: String },
  aieee_percentile: { type: String },
  form_no: {
    type: String
  },
  student_undertakings_date: { type: String },
  certificate_logs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteCertificateLog",
    },
  ],
  qviple_student_pay_id: {
    type: String
  },
  other_fees: [
    {
      fees: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OtherFees"
      },
      fee_receipt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReceipt"
      },
      status: {
        type: String,
        default: "Not Paid"
      },
      created_at: {
        type: Date,
        default: Date.now
      }
    }
  ],
  other_fees_remain_price: {
    type: Number,
    default: 0
  },
  other_fees_paid_price: {
    type: Number,
    default: 0
  },
  new_app: {
    appId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewApplication"
    },
    appName: { type: String },
    applicationDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department"
    },
    applicationBatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch"
    },
    applicationMaster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassMaster"
    }
  },
  other_fees_obj: {
    status: {
      type: String,
      default: "Not Paid"
    },
    receipt_file: {
      type: String,
    }
  },
  student_dynamic_subject: [
    {
      subjectName: { type: String },
      status: { type: String },
      _id: { type: String }
    }
  ],
  apps_fees_obj: {
    appId: { type: String },
    struct: { type: String },
    gta: { type: Number, default: 0}
  },
  scholar_name: {
    type: String
  },
  internal_evaluation_testset: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentTestSet",
    },
  ],
  intake_type: {
    type: String
  },
  student_application_obj: [
    {
      app: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewApplication"
      },
      staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff"
      },
      created_at: {
        type: Date,
        default: Date.now
      },
      flow: {
        type: String
      }
    }
  ],
  collect_docs: [
    {
      docs: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RequiredDocument"
      },
      not_filled: {
        type: String
      }
    }
  ]
});
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
