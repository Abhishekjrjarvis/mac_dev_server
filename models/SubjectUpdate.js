const mongoose = require("mongoose");

const subjectUpdateSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  updateDescription: {
    type: String,
    required: true,
  },
  upadateImage: [
    {
      documentType: {
        type: String,
      },
      documentName: {
        type: String,
      },
      documentSize: {
        type: String,
      },
      documentKey: {
        type: String,
      },
      documentEncoding: {
        type: String,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SubjectUpdate", subjectUpdateSchema);