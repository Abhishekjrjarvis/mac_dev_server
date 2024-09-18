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
  // In Lecture + Practical + Tutorial
  // Replace Lecture count + Time by hours + Minutes
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
    lecture_hours: {
      type: Number,
      default: 0,
    },
    lecture_minutes: {
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
    practical_hours: {
      type: Number,
      default: 0,
    },
    practical_minutes: {
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
    tutorial_hours: {
      type: Number,
      default: 0,
    },
    tutorial_minutes: {
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
      ref: "Student",
    },
  ],
  member_module_unique: {
    type: String,
    unique: true,
  },
  course_passing_credit: {
    type: Number,
  },
  one_day_attendance_lecture: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectLectureDay",
    },
  ],
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  timetable_update: {
    type: String,
    // "No" "Yes"
    default: "No",
  },
  teaching_plan: {
    type: String,
    // "No" "Yes"
    default: "No",
  },
  teaching_plan_logs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceTeachingPlanHistory",
    },
  ],
  export_collection: [
    {
      excel_type: {
        type: String,
      },
      excel_file: { type: String },
      excel_file_name: { type: String },
      created_at: { type: Date, default: Date.now },
    },
  ],
  export_collection_count: {
    type: Number,
    default: 0,
  },
  import_collection: [
    {
      excel_type: {
        type: String,
      },
      excel_file: { type: String },
      created_at: { type: Date, default: Date.now },
      status: {
        type: String,
      },
    },
  ],
  import_collection_count: {
    type: Number,
    default: 0,
  },
  fail: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  theory_students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  teaching_plan_copy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AutomateSubjectMaster",
    },
  ],
  timetableDayWise: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectTimetable",
    },
  ],
  timetableDateWise: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectTimetable",
    },
  ],
  internal_evaluation: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectInternalEvaluation",
    },
  ],
  attendance_time_slot: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassAttendanceTimeSlot",
    },
  ],
  class_master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClassMaster",
  },
  allotted_lecture: {
    type: Number,
    default: 0,
  },
  total_hours: {
    type: Number,
    default: 0,
  },
  hours_per_weak: {
    type: Number,
    default: 0,
  },
  course_objective: {
    type: String,
  },
  course_outcome: {
    type: String,
  },
  web_reference: {
    type: String,
  },
  book_reference: {
    type: String,
  },
  continuous_evaluation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectContinuousEvaluation",
  },
});

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;
