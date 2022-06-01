const mongoose = require("mongoose");
const InstituteChat = require('./InstituteChat')

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "InstituteChat" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const InstituteMessage = mongoose.model("InstituteMessage", messageSchema);
module.exports = InstituteMessage;
