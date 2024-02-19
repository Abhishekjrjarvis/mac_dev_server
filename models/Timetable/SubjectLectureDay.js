const mongoose = require("mongoose");

const subjectLectureDaySchema = new mongoose.Schema({
  attendDate: {
    type: String,
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  lecture: [
    {
      which_lecture: String,
    },
  ],
});

module.exports = mongoose.model("SubjectLectureDay", subjectLectureDaySchema);
