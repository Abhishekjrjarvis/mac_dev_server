const mongoose = require("mongoose");

const insAnnouncementSchema = new mongoose.Schema({
  insAnnTitle: { type: String },
  insAnnPhoto: { type: String },
  insAnnDescription: { type: String },
  insAnnVisibility: { type: String, default: 'Anyone' },
  anouncementDocument: [],
  createdAt: { type: Date, default: Date.now },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  reply: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReplyAnnouncement'
    }
  ],
  starList: []
});

module.exports = mongoose.model("InsAnnouncement", insAnnouncementSchema);
