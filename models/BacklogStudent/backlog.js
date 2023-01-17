const mongoose = require("mongoose");

const backlogSchema = new mongoose.Schema({
  backlog_subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  backlog_class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  backlog_batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
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
  backlog_symbol: {
    type: String,
    default: "Pending",
  },
});

module.exports = mongoose.model("Backlog", backlogSchema);
