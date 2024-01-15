const mongoose = require("mongoose");

const subjectMarksSchema = new mongoose.Schema({
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
  subjectName: { type: String },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  marks: [
    {
      examId: { type: String },
      examName: { type: String },
      examType: { type: String },
      examWeight: { type: Number },
      totalMarks: { type: Number },
      date: { type: String },
      startTime: { type: String },
      endTime: { type: String },
      duration: { type: String, default: 0 },
      obtainMarks: { type: Number, default: 0 },
      testSetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentTestSet",
      },
      answerSheet: [
        {
          documentType: {
            type: String,
          },
          documentName: {
            type: String,
          },
          documentSize: {
            type: String,
          },
          documentKey: {
            type: String,
          },
          documentEncoding: {
            type: String,
          },
        },
      ],
      is_backlog: {
        type: String,
        default: "No",
      },
      seating_sequence: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seating",
      },
      student_question_evaluation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentQuestionEvaluation",
      },
    },
  ],
  graceMarks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("SubjectMarks", subjectMarksSchema);
