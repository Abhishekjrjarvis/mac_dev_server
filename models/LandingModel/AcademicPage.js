const mongoose = require("mongoose")

const academicPageSchema = new mongoose.Schema({
    head_name: {
        type: String
    },
    head_images: [],
    head_about: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    landing_control: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LandingControl"
    },
    sub_head: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AcademicNestedPage"
        }
    ]

})

module.exports = mongoose.model("AcademicPage", academicPageSchema)