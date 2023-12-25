const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
  },
  subjectStatus: {
    type: String,
    default: "UnCompleted",
  },
  subjectTitle: {
    type: String,
    required: true,
  },
  subjectOptional: {
    type: String,
    default: "Mandatory",
  },
  subjectTeacherName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",
  },
  subjectMasterName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectMaster",
  },
  exams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
    },
  ],

  assignments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
    },
  ],
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  dailyUpdate: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectUpdate",
    },
  ],
  setting: {
    subjectPassingMarks: { type: Number, default: 0 },
  },
  universalDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  universalClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  universalSubject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  takeTestSet: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectMasterTestSet",
    },
  ],
  allotedTestSet: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AllotedTestSet",
    },
  ],
  pass: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  optionalStudent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  attendance: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendenceDate",
    },
  ],
  malicicous: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExamMalicious",
    },
  ],
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
  lecture_analytic: {
    lecture_count: {
      type: Number,
      default: 0,
    },
    lecture_time: {
      type: String,
    },
    lecture_complete: {
      type: Number,
      default: 0,
    },
  },
  practical_analytic: {
    practical_count: {
      type: Number,
      default: 0,
    },
    practical_time: {
      type: String,
    },
    practical_complete: {
      type: Number,
      default: 0,
    },
  },
  tutorial_analytic: {
    tutorial_count: {
      type: Number,
      default: 0,
    },
    tutorial_time: {
      type: String,
    },
    tutorial_complete: {
      type: Number,
      default: 0,
    },
  },
  chapter: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
    },
  ],
  chapter_count: {
    type: Number,
    default: 0,
  },
  topic_count_bifurgate: {
    early: {
      type: Number,
      default: 0,
    },
    delayed: {
      type: Number,
      default: 0,
    },
    timely: {
      type: Number,
      default: 0,
    },
  },
  selected_batch_query: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  subject_category: {
    type: String,
  },
  subject_attainment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectAttainment",
    },
  ],
  subject_attainment_mapping: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectAttainmentMapping",
    },
  ],
  shuffled_students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student"
    }
  ],
  member_module_unique: {
    type: String,
    unique: true
  },
  course_passing_credit: {
    type: Number,
  },

});

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;
