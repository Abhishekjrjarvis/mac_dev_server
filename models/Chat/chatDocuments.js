const mongoose = require("mongoose");

const chatDocumentSchema = new mongoose.Schema({
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
  },
});

module.exports = mongoose.model("ChatDocument", chatDocumentSchema);