const mongoose = require("mongoose");
const studentNotificationSchema = new mongoose.Schema({
  notifyContent: { type: String, required: true },
  notifyTime: { type: Date, default: Date.now },
  notifySender: { type: String },
  notifyReceiever: { type: String, required: true },
  notifyReadStatus: { type: String, default: "Unread" },
  notifyVisibility: { type: String, default: "Unhide" },
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
    ref: 'InstituteAdmin'
  },
  notifyByStaffPhoto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  notifyByStudentPhoto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  notifyBySubjectPhoto: {
    type: String,
  },
  notifyType: {
    type: String
  },
  notifyPublisher: {
    type: String
  },
  examId: { type: String },
  checklistId: { type: String },
  feesId: { type: String },
  mcqId: { type: String },
  assignmentId: { type: String },
  financeId: { type: String }
});

module.exports = mongoose.model(
  "StudentNotification",
  studentNotificationSchema
);
