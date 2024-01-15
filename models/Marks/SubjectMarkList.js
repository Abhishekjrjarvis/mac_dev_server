const mongoose = require("mongoose");
const subjectMarkListSchema = new mongoose.Schema({
  classMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClassMaster",
  },
  subjectMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectMaster",
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  exam_marks: [
    {
      exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
      },
      examWeight: { type: Number },
      examType: { type: String},
      is_backlog: {
        type: String,
        default: "No",
      },
      marks: [
        {
          student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
          related_subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
          },
          related_class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
          totalMarks: Number,
          maximumMarks: { type: Number},
        },
      ],
    },
  ],

  marks_list: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      totalNumber: {
        type: Number,
        default: 0,
      },
    },
  ],
});
module.exports = mongoose.model("SubjectMarkList", subjectMarkListSchema);
