const mongoose = require("mongoose");

const insAnnouncementSchema = new mongoose.Schema({
  insAnnTitle: { type: String },
  insAnnDescription: { type: String },
  insAnnVisibility: { type: String, default: "Anyone" },
  insAnnViewUser: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  announcementDocument: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InsDocument",
    },
  ],
  createdAt: { type: Date, default: Date.now },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  reply: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReplyAnnouncement",
    },
  ],
  starList: [],
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
  },
});

module.exports = mongoose.model("InsAnnouncement", insAnnouncementSchema);
