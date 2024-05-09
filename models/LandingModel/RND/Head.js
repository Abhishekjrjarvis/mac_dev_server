const mongoose = require("mongoose")

const rndSchema = new mongoose.Schema({
    head_name: {
        type: String
    },
    rnd_mou: [
        {
            srn: { type: String },
            org_name: { type: String },
            objectives: { type: String },
            durations: { type: String },
            link: { type: String },
            attach: { type: String }
        }
    ],
    rnd_activities: [
        {
            srn: { type: String },
            title: { type: String },
            description: { type: String },
            link: { type: String },
            attach: { type: String }
        }
    ],
    rnd_projects: [
        {
            srn: { type: String },
            title: { type: String },
            student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
            classes: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
            subject: { type: String },
            guide_name: { type: String },
            link: { type: String },
            attach: { type: String }
        }
    ],
    rnd_paper: [
        {
            staff: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
            department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
            category: { type: String },
            title: { type: String },
            funding_agency: { type: String },
            collaboration: { type: String },
            link: { type: String },
            attach: { type: String }
        }
    ],
    custom_authority: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CustomAuthority"
    }
})

module.exports = mongoose.model("Head", rndSchema)