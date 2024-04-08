const mongoose = require("mongoose");

const streamTypeSchema = new mongoose.Schema({
  institute_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteType",
  },
  affiliated_with: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University",
  },
  department_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DepartmentType",
  },
  name: {
    type: String,
  },

  cls_master: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AutomateClassMaster",
    },
  ],
  subject_master: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AutomateSubjectMaster",
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
  automate_institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AutomateInstitute",
  },
  instituteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
  },
  po: [
    {
      attainment_name: {
        type: String,
      },
      // CO   //  PO
      attainment_type: {
        type: String,
      },
      attainment_description: {
        type: String,
      },
    },
  ],
  po_count: Number,
  department: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
});

module.exports = mongoose.model("StreamType", streamTypeSchema);
