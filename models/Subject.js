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
});

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;
