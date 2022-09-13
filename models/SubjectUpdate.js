const mongoose = require(mongoose);

const subjectUpdateSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  updateDate: {
    type: Date,
    required: true,
  },
  updateDescription: {
    type: String,
    required: true,
  },
  upadateImage: [],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SubjectUpdate", subjectUpdateSchema);
