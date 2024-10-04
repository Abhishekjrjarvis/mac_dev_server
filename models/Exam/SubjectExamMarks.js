const mongoose = require("mongoose");
const subjectExamMarksSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  subject_master: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectMaster",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  student_list: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      obtain_marks: {
        type: Number,
        default: 0,
      },
    },
  ],
});

module.exports = mongoose.model("SubjectExamMarks", subjectExamMarksSchema);
