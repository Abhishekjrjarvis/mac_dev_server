const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  notifyContent: { type: String, required: true },
  notifyTime: { type: Date, default: Date.now },
  notifySender: { type: String },
  notifyReceiever: { type: String, required: true },
  notifyReadStatus: { type: String, default: "Unread" },
  notifyVisibility: { type: String, default: "Unhide" },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  notifyByPhoto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  notifyByInsPhoto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  notifyByStaffPhoto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  notifyByDepartPhoto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  notifyByStudentPhoto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  notifyByClassPhoto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  notifyBySuperAdminPhoto: {
    type: String,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
