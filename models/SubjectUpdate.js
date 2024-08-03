const mongoose = require("mongoose");

const subjectUpdateSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  updateDescription: {
    type: String,
  },
  date: {
    type: Date,
  },
  yt_link: {
    type: String,
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
  daily_topic: [
    {
      topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChapterTopic",
      },
      status: {
        type: String,
        ref: "Pending",
      },
      current_status: {
        type: String,
      },
      extra_lecture: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "AttendenceDate",
        },
      ],
      teaching_method: {
        type: String,
      },
    },
  ],
  daily_topic_list: [],
});

module.exports = mongoose.model("SubjectUpdate", subjectUpdateSchema);
