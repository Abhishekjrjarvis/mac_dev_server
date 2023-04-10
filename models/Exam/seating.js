const mongoose = require("mongoose");

const seatingSchema = new mongoose.Schema({});

module.exports = mongoose.model("Seating", seatingSchema);
