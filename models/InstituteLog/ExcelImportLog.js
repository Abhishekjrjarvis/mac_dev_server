const mongoose = require("mongoose");

const excelImportLog = new mongoose.Schema({
  import_type: String,
  import_id: String,
  import_institute_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InstituteAdmin",
  },
  status: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  import_data: [],
});

module.exports = mongoose.model("ExcelImportLog", excelImportLog);
