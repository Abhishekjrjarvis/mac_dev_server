const mongoose = require("mongoose");

const studentQuestionEvaluationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
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
  question_evaluation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "QuestionEvaluation",
  },
  total_main_question: {
    type: Number,
  },
  main_questions: [
    {
      main_question_id: String,
      question_index: Number,
      question_content: String,
      attainment_mark: {
        type: Number,
      },
      obtain_mark: {
        type: Number,
      },
      subject_attainment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubjectAttainment",
      },
      sub_questions: [
        {
          sub_question_id: String,
          question_index: Number,
          question_content: String,
          attainment_mark: {
            type: Number,
          },
          obtain_mark: {
            type: Number,
          },
          subject_attainment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubjectAttainment",
          },
          topic_questions: [
            {
              topic_question_id: String,
              question_index: Number,
              question_content: String,
              attainment_mark: {
                type: Number,
              },
              obtain_mark: {
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
});

module.exports = mongoose.model(
  "StudentQuestionEvaluation",
  studentQuestionEvaluationSchema
);
