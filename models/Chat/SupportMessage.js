const mongoose = require("mongoose");

const supportMessageSchema = mongoose.Schema(
  {
    sender: { 
        type: String,
        required: true
    },
    content: { 
        type: String, 
        trim: true 
    },
    chat: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "SupportChat" 
    },
    readBySelf: {
        type: String,
        default: false
    },
    delievered: {
        type: String,
        default: false
    }
  },
  { timestamps: true }
);

const Message = mongoose.model("SupportMessage", supportMessageSchema);
module.exports = Message;
