const mongoose = require("mongoose");
const InstituteAdmin = require("./InstituteAdmin");
const ReplyAnnouncement = require('./ReplyAnnouncement')

const insAnnouncementSchema = new mongoose.Schema({
  insAnnTitle: { type: String },
  insAnnPhoto: { type: String },
  insAnnDescription: { type: String },
  insAnnVisibility: { type: String },
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
  ]
});

const InsAnnouncement = mongoose.model(
  "InsAnnouncement",
  insAnnouncementSchema
);

module.exports = InsAnnouncement;
