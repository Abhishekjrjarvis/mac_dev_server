const mongoose = require("mongoose");

const subjectMasterSchema = new mongoose.Schema({
  subjectName: { type: String, required: true },
  subjectType: { type: String, default: "Mandatory" },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },

  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
  ],
  testSet: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMasterTestSet",
    },
  ],
  allQuestion: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMasterQuestion",
    },
  ],

  subjectCount: {
    type: Number,
    default: 0,
  },
  backlog: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Backlog",
    },
  ],
  backlogStudentCount: {
    type: Number,
    default: 0,
  },
  subject_mark_list: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMarkList",
    },
  ],
  course_credit: {
    type: Number,
    default: 10,
  },
  co_attainment_count: {
    type: Number,
    default: 0,
  },
  co_attainment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attainment",
    },
  ],
  course_code: {
    type: String
  },
  course_passing_credit: {
    type: Number,
  },
  max_obtain: [
    {
      batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
      obtain_value: {
        type: Number,
        default: 0,
      },
      // max_value: {
      //   type: Number,
      //   default: 0,
      // },
      // subject_category: String,
    },
  ],
  automate_subject_master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AutomateSubjectMaster",
  },
  is_practical: {
    type: Boolean,
    default: false,
  },
  is_tutorial: {
    type: Boolean,
    default: false,
  },
  is_theory: {
    type: Boolean,
    default: false,
  },
  link_department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },
  studentCount: {
    type: Number,
    default: 0
  }
});

const SubjectMaster = mongoose.model("SubjectMaster", subjectMasterSchema);

module.exports = SubjectMaster;
