const mongoose = require("mongoose");

const attainmentMappingSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  copo: [
    {
      copoId: {
        type: String,
      },
      poId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attainment",
      },
      coId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attainment",
      },
      co_relation: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model(
  "SubjectAttainmentMapping",
  attainmentMappingSchema
);