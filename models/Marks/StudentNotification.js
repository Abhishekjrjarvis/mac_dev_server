const mongoose = require("mongoose");
const studentNotificationSchema = new mongoose.Schema({
  notifyContent: { type: String, required: true },
  notifyTime: { type: Date, default: Date.now },
  notifySender: { type: String },
  notifyReceiever: { type: String, required: true },
  notifyReadStatus: { type: String, default: "Unread" },
  notifyVisibility: { type: String, default: "Unhide" },
  notifyViewStatus: { type: String, default: "Not View" },
  redirectIndex: { type: Number },
  notifyByClassPhoto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  notifyByDepartPhoto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  notifyByInsPhoto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  notifyByStaffPhoto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  notifyByStudentPhoto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  notifyBySubjectPhoto: {
    subject_id: { type: String },
    subject_name: { type: String },
    subject_cover: { type: String },
    subject_title: { type: String },
  },
  notifyByExamPhoto: {
    exam_id: { type: String },
    exam_name: { type: String },
  },
  notifyByFinancePhoto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Finance",
  },
  notifyByAdmissionPhoto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admission",
  },
  notifyType: {
    type: String,
  },
  notifyPublisher: {
    type: String,
  },
  examId: { type: String },
  checklistId: { type: String },
  feesId: { type: String },
  mcqId: { type: String },
  assignmentId: { type: String },
  financeId: { type: String },
  classId: { type: String },
  departmentId: { type: String },
  subjectId: { type: String },
  dailyUpdateId: { type: String },
  batchId: { type: String },
  instituteId: { type: String },
  electionId: { type: String },
  notifyCategory: { type: String },
  notify_hi_content: { type: String },
  notify_mr_content: { type: String },
  election_type: { type: String },
  vote_status: { type: String },
  election_winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  participateEventId: { type: String },
  participate_event_type: { type: String },
  event_payment_status: { type: String },
  mentorId: { type: String },
});

module.exports = mongoose.model(
  "StudentNotification",
  studentNotificationSchema
);
