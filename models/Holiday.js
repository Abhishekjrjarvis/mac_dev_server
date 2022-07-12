const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema({
  dDate: [],
  dHolidayReason: {
    type: String,
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
});

const Holiday = mongoose.model("Holiday", holidaySchema);

module.exports = Holiday;
