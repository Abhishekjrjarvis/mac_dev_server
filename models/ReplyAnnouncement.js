const mongoose = require("mongoose");

const replyAnnSchema = new mongoose.Schema({
  replyText: {
    type: String,
    required: true,
  },
  replyAuthorAsIns: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  replyAuthorAsUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ReplyAnnouncement", replyAnnSchema);
