const mongoose = require("mongoose")

const requiredDocumentSchema = new mongoose.Schema({
    document_name: { type: String },
    document_key: { type: String },
    applicable_to: { type: String },
    created_at: { type: Date, default: Date.now },
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
        }
    ],
    admission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admission"
    }
})

module.exports = mongoose.model("RequiredDocument", requiredDocumentSchema)