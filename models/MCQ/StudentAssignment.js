const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  assignmentName: {
    type: String,
    required: true,
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  dueDate: {
    type: String,
  },
  descritpion: {
    type: String,
  },
  testSet: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentTestSet",
    },
  ],
  files: [
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

  assignmentSubmitRequest: {
    type: Boolean,
    default: false,
  },
  assignmentSubmit: {
    type: Boolean,
    default: false,
  },
  studentDescritpion: {
    type: String,
  },
  studentFiles: [
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
  submmittedDate: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  assignment_total_mark: { type: Number },
  assignment_obtain_mark: { type: Number },
});

module.exports = mongoose.model("StudentAssignment", assignmentSchema);
