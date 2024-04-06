const mongoose = require("mongoose");

const automateSubjectMasterSchema = new mongoose.Schema({
  subjectName: String,
  cls: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AutomateClassMaster",
  },
  subjectType: String,
  stream_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StreamType",
  },
  is_practical: {
    type: Boolean,
    default: false,
  },
  teaching_plan: {
    theory: [{ type: mongoose.Schema.Types.ObjectId, ref: "AutomateChapter" }],
    tutorial: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AutomateChapter" },
    ],
    practical: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AutomateChapter" },
    ],
  },
  created_by: {
    type: String,
    // Admin or other institute
    default: "Admin",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },

  co: [
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
      attainment_code: {
        type: String,
      },
      attainment_target: {
        type: Number,
      },
    },
  ],
  co_count: Number,
  is_tutorial: {
    type: Boolean,
    default: false,
  },
  is_theory: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model(
  "AutomateSubjectMaster",
  automateSubjectMasterSchema
);
