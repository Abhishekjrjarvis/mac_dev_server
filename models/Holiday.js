const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema({
  dDate: [{ type: String }],
  dHolidayReason: {
    type: String,
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
  },
  description: {
    type: String,
  },
});

const Holiday = mongoose.model("Holiday", holidaySchema);

module.exports = Holiday;
