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
  staffDistrict: { type: String },
  staffState: { type: String },
  staffAddress: { type: String },
  staffPhoneNumber: { type: Number, maxlength: 10, minlength: 10 },
  staffAadharNumber: { type: String, maxlength: 12, minlength: 12 },
  staffQualification: { type: String },
  staffDocuments: { type: String },
  staffAadharFrontCard: { type: String },
  staffAadharBackCard: { type: String },
  staffPanNumber: { type: String },
  staffBankName: { type: String },
  staffBankAccount: { type: String },
  staffBankAccountHolderName: { type: String },
  staffBankIfsc: { type: String },
  staffBankAccountType: { type: String },
  staffUpiId: { type: String },
  staffHeight: { type: String },
  staffWeight: { type: String },
  staffBMI: { type: String },
  staffCasteCertificate: [],
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
});

const Staff = mongoose.model("Staff", staffSchema);

module.exports = Staff;
