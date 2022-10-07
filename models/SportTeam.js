const mongoose = require('mongoose')

const sportTeamSchema = new mongoose.Schema({
    sportClassTeamName: {
        type: String,
        required: true
    },
    sportTeamStudent: [
        {
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student'
            },
            asCaptain: { type: String, default: 'Member' },
        },
    ],
    sportClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SportClass'
    },
    sportEventMatch: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SportEventMatch'
        }
    ],
    sportTeamStudentCount: {
        type: Number,
        default: 0
    },
    sportEventMatch: {
        type: Number,
        default: 0
    },
    rankTitle: {
        type: String
    },
    teamPoints: {
        type: Number,
        default: 0
    },
    sportTeamPhoto: {
        type: String
    },
    photoId: {
        type: String,
        default: 0
    },
    sportTeamCaptain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }
})

const SportTeam = mongoose.model('SportTeam', sportTeamSchema)

module.exports = SportTeam