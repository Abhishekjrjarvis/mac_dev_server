const mongoose = require('mongoose')

const sportEventMatchSchema = new mongoose.Schema({
    sportEventMatchName: { type: String, required: true },
    sportEventMatchDate: { type: String, required: true },
    sportEventProfile: { type: String },
    sportEventMatchClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SportClass',
        required: true
    },
    sportEvent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SportEvent'
    },
    sportEventMatchCategory: { type: String, required: true },
    sportEventMatchCategoryLevel: { type: String, required: true },
    sportPlayer1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    sportPlayer2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    sportFreePlayer: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],
    sportFreePlayerCount: {
        type: Number,
        default: 0
    },
    sportTeam1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SportTeam'
    },
    sportTeam2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SportTeam'
    },
    matchStatus: {
        type: String,
        default: 'Not Completed'
    },
    sportWinner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    sportRunner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    sportWinnerTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SportTeam'
    },
    sportRunnerTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SportTeam'
    },
    sportParticipants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],
    // sportPlayer: { 
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Student'
    // },
    sportOpponentPlayer: { type: String },
    rankMatch: { type: String },
    sportInterParticipants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
})


const SportEventMatch = mongoose.model('SportEventMatch', sportEventMatchSchema)


module.exports = SportEventMatch