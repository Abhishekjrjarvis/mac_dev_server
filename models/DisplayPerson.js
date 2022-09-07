const mongoose = require("mongoose");

const displaySchema = new mongoose.Schema({
  displayTitle: {
    type: String,
    required: true,
  },
  displayUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  displayBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  displayByDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  displayByClass: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
});

module.exports = mongoose.model("DisplayPerson", displaySchema);
