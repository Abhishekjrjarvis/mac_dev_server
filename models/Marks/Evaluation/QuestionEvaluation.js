const mongoose = require("mongoose");

const questionEvalutionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
  },
  subjectMasterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectMaster",
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  total_main_question: {
    type: Number,
  },
  main_questions: [
    {
      question_index: Number,
      question_content: String,
      attainment_mark: {
        type: Number,
      },
      subject_attainment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubjectAttainment",
      },
      sub_questions: [
        {
          question_index: Number,
          question_content: String,

          attainment_mark: {
            type: Number,
          },
          subject_attainment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubjectAttainment",
          },
          topic_questions: [
            {
              question_index: Number,
              question_content: String,

              attainment_mark: {
                type: Number,
              },
              subject_attainment: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SubjectAttainment",
              },
            },
          ],
        },
      ],
    },
  ],
  allotted_paper: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentQuestionEvaluation",
    },
  ],
  //   ExamController.js
  // allStudentMarksBySubjectTeacher,
  // oneStudentMarksBySubjectTeacher,
  // oneStudentReportCardClassTeacher,
  // getAllClassExportReport,
  // one_student_finalize_report,
  // backlogAllStudentMarksBySubjectTeacher,
});

module.exports = mongoose.model("QuestionEvaluation", questionEvalutionSchema);
