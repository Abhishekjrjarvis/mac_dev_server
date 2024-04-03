const mongoose = require("mongoose");

const automateInstituteSchema = new mongoose.Schema({
  institute_type: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteType",
    },
  ],
  affiliated_with: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },
  ],
  department_type: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DepartmentType",
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

  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
  },
});

module.exports = mongoose.model("AutomateInstitute", automateInstituteSchema);
