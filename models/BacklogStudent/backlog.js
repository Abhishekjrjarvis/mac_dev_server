const mongoose = require("mongoose");

const backlogSchema = new mongoose.Schema({
  backlog_subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  backlog_status: {
    type: String,
    default: "Not Mark",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  backlog_students: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  backlog_clear: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  backlog_dropout: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
});

module.exports = mongoose.model("Backlog", backlogSchema);
