const mongoose = require("mongoose")

const facilitiesSchema = new mongoose.Schema({
    facilities_attach: {
        title: {
            type: String
        },
        attach: {
            type: String
        }
    },
    created_at: {
        type: String
    },
    institute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InstituteAdmin"
    },
    facilities_overview: [
        {
            headline: {
                type: String
            },
            headline_content: {
                type: String
            }
        }
    ]
})

module.exports = mongoose.model('Facilities', facilitiesSchema)