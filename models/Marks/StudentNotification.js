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
});

module.exports = mongoose.model(
  "StudentNotification",
  studentNotificationSchema
);
