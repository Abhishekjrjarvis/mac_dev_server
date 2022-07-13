const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    chatProfilePhoto: { type: String },
    chatDescription: { type: String },
    chatVisibility: { type: String, default: 'Enable' },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    message:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      }
    ],
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastSeen: {
      type: String,
    },
    isOnline: {
      type: String
    }
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;
