const mongoose = require("mongoose");

const attainmentSchema = new mongoose.Schema({
  attainment_name: {
    type: String,
  },

  // CO   //  PO
  attainment_type: {
    type: String,
  },
  attainment_code: {
    type: String,
  },
  attainment_target: {
    type: Number,
  },
  attainment_description: {
    type: String,
  },
  subject_master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectMaster",
  },
  subject_attainment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectAttainment",
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
  //   exam: [
  //     {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "Exam",
  //     },
  //   ],
  //   assignment: [
  //     {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "Assignment",
  //     },
  //   ],
});

module.exports = mongoose.model("Attainment", attainmentSchema);
