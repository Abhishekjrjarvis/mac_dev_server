const mongoose = require("mongoose");

const attainmentMappingSchema = new mongoose.Schema({
  co: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attainment",
  },
  po: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attainment",
    },
  ],
  copo: [
    {
      copoId: {
        type: String,
      },
      poId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attainment",
      },
      //   coId: [
      //     {
      //       type: mongoose.Schema.Types.ObjectId,
      //       ref: "Attainment",
      //     },
      //   ],
      co_relation: {
        type: String,
      },
      //   course_po_mapping: {
      //     type: Number,
      //     default: 0,
      //   },
    },
  ],
});

module.exports = mongoose.model(
  "SubjectAttainmentMapping",
  attainmentMappingSchema
);