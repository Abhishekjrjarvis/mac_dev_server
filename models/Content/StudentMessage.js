const mongoose = require("mongoose")

const studentMessageSchema = new mongoose.Schema({
    message: {
        type: String,
      },
      message_title: {
        type: String
      },
      message_document: {
        type: String
      },
      student_list: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
      ],
      created_at: {
        type: Date,
        default: Date.now,
      },
      student_list_count: {
        type: Number,
        default: 0,
      },
      message_type: {
        type: String,
      },
      from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Staff",
      },
      from_name: {
        type: String,
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstituteAdmin"
      }
})

module.exports = mongoose.model("StudentMessage", studentMessageSchema)