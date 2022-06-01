const mongoose = require("mongoose");
const McqQuestions = require("./McqQuestions");

const questionSchema = new mongoose.Schema({
  onequestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "McqQuestions",
  },
  mark: {
    type: Number,
  },
});

module.exports = mongoose.model("Question", questionSchema);
