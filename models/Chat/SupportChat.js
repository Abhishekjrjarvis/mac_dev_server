const mongoose = require("mongoose");

const supportChatSchema = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportMessage",
    },
    message:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SupportMessage",
      }
    ],
    lastSeen: {
      type: String,
    },
    isOnline: {
      type: String
    }
  },
  { timestamps: true }
);

const Chat = mongoose.model("SupportChat", supportChatSchema);

module.exports = Chat;
