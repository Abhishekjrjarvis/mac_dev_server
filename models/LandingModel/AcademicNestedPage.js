const mongoose = require("mongoose")

const academicNestedPage = new mongoose.Schema({
    sub_head_title: [{
        type: String
    }],
    sub_heading_image: [{
        type: String
    }],
    sub_head_body: [{
        type: String
    }],
    sub_head_title_main: {
        type: String
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    academic_page: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcademicPage"
    },
sub_topic:[{
  sub_head_title:String,
  sub_heading_image:String,
  sub_head_body:String,
},],
})

module.exports = mongoose.model("AcademicNestedPage", academicNestedPage)