const mongoose = require("mongoose");
const InstituteAdmin = require('./InstituteAdmin')
const User = require('./User')
const InstituteMessage = require('./InstituteMessage')


const chatModel = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: true },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteMessage",
    },
    messageList: [
      {
        type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteMessage",
      }
    ],
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "InstituteAdmin" },
  },
  { timestamps: true }
);

const InstituteChat = mongoose.model("InstituteChat", chatModel);

module.exports = InstituteChat;