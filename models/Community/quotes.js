const mongoose = require("mongoose");

const quotesSchema = new mongoose.Schema({
  quote_text: {
    type: String,
  },
  quote_author: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  quote_tag: {
    type: String,
  },
  quote_autor_image: {
    type: String,
  },
  quote_length: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Quotes", quotesSchema);
