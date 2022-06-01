const mongoose = require("mongoose");
const McqQuestions = require("./McqQuestions");
const SubMaster = require("./SubjectMaster")
const classMaster = require("./ClassMaster")
const student = require("./Student")
const McqTestSet = require("./McqTestSets")
const Exam = require("./Exam")

const scheduleTestSet = new mongoose.Schema({
    testSubjectMaster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubMaster",
    },
    testClassMaster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "classMaster",
    },
    testSet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "McqTestSet",
    },
    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
    },
    scheduleTestStatus: {
        type: String,
        default: "Not Taken"
    },
    testSetExamName: {
        type: String,
    },
    testSetSolTime: {
        type: Number,
    },
    testTakenDate: {
        type: Date,
    },
    participatingStudent: [
        {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "student",
        },
        studentName: {
            type: String,
        },
        studentMarks: {
            type: Number,
        }
        }
    ]
});
const ScheduleTestSets = mongoose.model("ScheduleTestSets", scheduleTestSet);

module.exports = ScheduleTestSets;
