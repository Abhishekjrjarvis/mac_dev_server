const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
    poll_question: {
        type: String
    },
    poll_answer: [
        {
            content: { type: String },
            percent_vote: { type: Number, default: 0 },
            color_type: { type: String, default: '#F0F0F0' },
            users: [],
            content_script: { type: String },
        }
    ],
    total_votes: {
        type: Number,
        default: 0
    },
    duration_date: {
        type: String
    },
    duration_time: {
        type: String
    },
    poll_policy: {
        type: String
    },
    poll_status: {
        type: String,
        default: 'Open'
    },
    userPollCount: {
        type: Number,
        default: 0
    },
    answeredUser: [],
    createdAt: {
        type: Date,
        default: Date.now
    },
    poll_question_transcript: { type: String }
});

const Poll = mongoose.model("Poll", pollSchema);

module.exports = Poll;
