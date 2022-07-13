const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    content: { 
        type: String, 
        trim: true 
    },
    chat: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Chat" 
    },
    readBy: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User" 
        }
    ],
    video: {
        type: String
    },
    image: {
        type: String
    },
    document: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChatDocument'
        }
    ],
    readBySelf: {
        type: String,
        default: false
    },
    delievered: {
        type: String,
        default: false
    },
    replyMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReplyChat'
    },
    forwardMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ForwardMessage'
    }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
