const mongoose = require("mongoose");

const gradeSystemSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  grade_type: {
    type: String,
    default: "Slab based",
  },
  grade_name: {
    type: String,
  },
  grade_count: {
    type: Number,
  },

  grades: [
    {
      serial_no: Number,
      start_range: Number,
      end_range: Number,
      grade_symbol: String,
    },
  ],
  custom_grade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "GradeSystem",
  },
  grade_insert: {
    type: String,
  },
  choosen_department: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  ],
});

module.exports = mongoose.model("GradeSystem", gradeSystemSchema);
