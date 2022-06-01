const mongoose = require("mongoose");
const staff = require("./Staff")
const SubMaster = require("./SubjectMaster")
const classMaster = require("./ClassMaster")

const mcqQuestions = new mongoose.Schema({
    subjectMaster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubMaster",
    },
    classMaster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "classMaster",
    },
    question: {
        type: String,
    },
    questionOptions: [
        {
            type: String,
        },
    ],
    queSolutionOpt: {
        type: Number,
    },
    queSolutionText: {
        type: String,
    },
    queSolutionImg: {
        type: String,
    }
});

const McqQuestions = mongoose.model("McqQuestions", mcqQuestions);

module.exports = McqQuestions;
