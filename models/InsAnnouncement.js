const mongoose = require("mongoose");

const insAnnouncementSchema = new mongoose.Schema({
  insAnnTitle: { type: String },
  insAnnDescription: { type: String },
  insAnnVisibility: { type: String, default: "Anyone" },
  insAnnViewUser: [],
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
});

module.exports = mongoose.model("InsAnnouncement", insAnnouncementSchema);
