const mongoose = require("mongoose");

const hostelBedSchema = new mongoose.Schema({
  bed_allotted_candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  bed_number: {
    type: Number,
    default: 0,
  },
  bed_status: {
    type: String,
    default: "Not Allotted",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  hostelRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HostelRoom",
  },
});

module.exports = mongoose.model("HostelBed", hostelBedSchema);
