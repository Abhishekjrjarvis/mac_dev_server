const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  documentType: {
    type: String,
    required: true,
  },
  documentName: {
    type: String,
    required: true,
  },
  documentSize: {
    type: String,
    required: true,
  },
  documentKey: {
    type: String,
    required: true,
  },
  documentEncoding: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("InsDocument", documentSchema);