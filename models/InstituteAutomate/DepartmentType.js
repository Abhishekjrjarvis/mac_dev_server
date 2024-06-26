const mongoose = require("mongoose");

const departmentTypeSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  automate_institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AutomateInstitute",
  },
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  created_by: {
    type: String,
    // Admin or other institute
    default: "Admin",
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University",
  },
  streams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StreamType",
    },
  ],
});

module.exports = mongoose.model("DepartmentType", departmentTypeSchema);
