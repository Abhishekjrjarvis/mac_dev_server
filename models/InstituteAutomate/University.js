const mongoose = require("mongoose");

const universitySchema = new mongoose.Schema({
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
  streams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StreamType",
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
  created_by: {
    type: String,
    // Admin or other institute
    default: "Admin",
  },
  institute_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteType",
  },
  department_type: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DepartmentType",
    },
  ],
});

module.exports = mongoose.model("University", universitySchema);
