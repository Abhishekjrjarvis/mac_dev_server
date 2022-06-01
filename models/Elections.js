const mongoose = require("mongoose");
const Class = require("./Class");
const Department = require("./Department");
const Student = require("./Student");


const electionsSchema = new mongoose.Schema({
  electionForDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },

  positionName: { type: String },
  applicationSDate: { type: Date },
  applicationLDate:{ type: Date },
  electionVotingSDate: { type: Date },
  electionVotingLDate: { type: Date },
  totalVoters: { type: Number },
  electionResult: {
    type: Boolean,
    default: false,
  },
  winnerCandidates:{
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    runnerUp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    runnerUp2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  },
  voteCount: [
    {
      voterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      votedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    },
  ],
  candidates: [
    {
      selectionStatus: { type: String, default: "Not Selected" },
      studentName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      supportiveMember: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
          }
        ],
      tagLine: {
        type: String,
      },
      vote: { type: Number, default: 0 },
    },
  ],
});

const Elections = mongoose.model("Elections", electionsSchema);

module.exports = Elections;
