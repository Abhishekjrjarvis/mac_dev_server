const mongoose = require("mongoose");

const behaviourSchema = new mongoose.Schema({
  improvements: {
    type: String,
    required: true,
  },
  ratings: {
    type: Number,
    required: true,
  },
  lackIn: {
    type: String,
    required: true,
  },
  studentName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  className: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
});

const Behaviour = mongoose.model("Behaviour", behaviourSchema);

module.exports = Behaviour;
