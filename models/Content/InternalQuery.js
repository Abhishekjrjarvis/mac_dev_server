const mongoose = require("mongoose");

const internalQuerySchema = new mongoose.Schema({
  query_by_student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  query_content: {
    type: String,
  },
  query_status: {
    type: String,
    default: "Pending",
  },
  query_to_admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
});

module.exports = mongoose.model("InternalQuery", internalQuerySchema);
