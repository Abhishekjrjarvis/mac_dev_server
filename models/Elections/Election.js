const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema({
  election_position: {
    type: String,
    required: true,
  },
  election_visible: {
    type: String,
    required: true,
  },
  election_app_start_date: {
    type: Date,
  },
  election_app_end_date: {
    type: Date,
  },
  election_selection_date: {
    type: Date,
  },
  election_campaign_date: {
    type: Date,
  },
  election_campaign_last_date: {
    type: Date,
  },
  election_voting_date: {
    type: Date,
  },
  election_result_date: {
    type: Date,
  },
  department: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
  election_status: {
    type: String,
    default: "Ongoing",
  },
  election_total_voter: {
    type: Number,
    default: 0,
  },
  election_vote_cast: {
    type: Number,
    default: 0,
  },
  election_candidate: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
      election_candidate_status: { type: String, default: "Pending" },
      election_result_status: { type: String, default: "Participants" },
      election_vote_receieved: { type: Number, default: 0 },
      election_tag_line: { type: String },
      election_description: { type: String },
      voted_student: [],
      election_supporting_member: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
        },
      ],
    },
  ],
  vote_notification: {
    type: String,
    default: "Close",
  },
  result_notification: {
    type: String,
    default: "Not Declare",
  },
  event_manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EventManager",
  },
});

module.exports = mongoose.model("Election", electionSchema);
