const mongoose = require("mongoose");
const standardMarkListSchema = new mongoose.Schema({
  classMaster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ClassMaster",
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
  },
  marks: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      related_class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
      totalMarks: Number,
    },
  ],
  marks_list: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      totalMarks: {
        type: Number,
        default: 0,
      },
    },
  ],

  // due to some optional related things fail
  // subject_count: Number,
});

module.exports = mongoose.model("StandardMarkList", standardMarkListSchema);
